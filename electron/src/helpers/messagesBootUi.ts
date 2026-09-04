import type { BrowserWindow } from "electron";
import fs from "fs";
import os from "os";
import path from "path";
import { bootMark } from "./bootTiming";
import { shouldRetryMessagesLoad } from "./loadFail";
import {
  isMessagesGoogleUrl,
  MESSAGES_BLANK_RETRY_MS,
  MESSAGES_SPA_PROBE_JS,
  MESSAGES_WEB_URL,
  messagesLoadUrlOptions,
  spaProbeShowsBlank,
  spaProbeShowsReady,
} from "./messagesBoot";
import { navigateMessagesWithLifecycle } from "./rendererLifecycle";
import {
  SPLASH_FALLBACK_MS,
  SPLASH_MIN_VISIBLE_MS,
  SPLASH_SPA_POLL_MS,
  splashDismissDelayMs,
} from "./splash";
import { dismissLaunchSplash, raiseLaunchSplash, setSplashStage, attachSplashToMain } from "./splashUi";

/** Show and un-throttle before navigation so the SPA is not stuck on about:blank. */
export function prepareMainWindowForMessagesLoad(
  win: BrowserWindow,
  opts?: { reveal?: boolean; raise?: boolean }
): void {
  if (win.isDestroyed()) return;
  try {
    win.webContents.setBackgroundThrottling(false);
  } catch {
    /* race teardown */
  }
  if (opts?.reveal === false) return;
  // Prefer showInactive so an always-on-top splash stays visible (Windows).
  if (!win.isVisible()) {
    try {
      win.showInactive();
    } catch {
      win.show();
    }
  }
  // While splash covers, do not raise/focus main (avoids gray shell on top).
  if (opts?.raise === false) return;
  win.moveTop();
  win.focus();
  win.webContents.focus();
}

async function probeMessagesSpa(win: BrowserWindow): Promise<{
  blank: boolean;
  result: unknown;
}> {
  if (win.isDestroyed()) return { blank: true, result: null };
  const url = win.webContents.getURL();
  if (shouldRetryMessagesLoad(url)) return { blank: true, result: null };
  if (!isMessagesGoogleUrl(url)) return { blank: false, result: null };
  try {
    const result = await win.webContents.executeJavaScript(
      MESSAGES_SPA_PROBE_JS,
      true
    );
    return { blank: spaProbeShowsBlank(result), result };
  } catch {
    return { blank: true, result: null };
  }
}

function writeBootProbe(result: unknown): void {
  if (!process.env.GMFD_WRITE_BOOT_PROBE || result == null) return;
  try {
    fs.writeFileSync(
      path.join(os.tmpdir(), "gmfd-boot-ok.json"),
      JSON.stringify(result)
    );
  } catch {
    /* best-effort probe artifact */
  }
}

async function loadMessagesUrl(win: BrowserWindow): Promise<void> {
  if (win.isDestroyed()) return;
  bootMark("loadURL_start");
  await win.loadURL(MESSAGES_WEB_URL, messagesLoadUrlOptions()).catch(() => {});
}

export function bindMessagesWebBoot(
  win: BrowserWindow,
  opts?: { splash?: BrowserWindow | null; onBootDone?: () => void }
): void {
  const splash = opts?.splash ?? null;
  const splashShownAt = Date.now();
  const coverWithSplash = splash != null && !splash.isDestroyed();
  const timers: ReturnType<typeof setTimeout>[] = [];
  const intervals: ReturnType<typeof setInterval>[] = [];
  let splashTimer: ReturnType<typeof setTimeout> | null = null;
  let splashRaiseTimer: ReturnType<typeof setInterval> | null = null;
  let pollStarted = false;
  let reloads = 0;
  let navigating = false;
  let bootDone = false;
  let splashDone = false;
  const maxReloads = MESSAGES_BLANK_RETRY_MS.length + 2;

  const clearBootTimers = (): void => {
    while (timers.length) {
      const t = timers.pop();
      if (t != null) clearTimeout(t);
    }
    while (intervals.length) {
      const t = intervals.pop();
      if (t != null) clearInterval(t);
    }
  };

  const clearSplashTimer = (): void => {
    if (splashTimer != null) {
      clearTimeout(splashTimer);
      splashTimer = null;
    }
  };

  const finishSplash = (): void => {
    if (splashDone) return;
    splashDone = true;
    clearSplashTimer();
    if (splashRaiseTimer != null) {
      clearInterval(splashRaiseTimer);
      splashRaiseTimer = null;
    }
    dismissLaunchSplash(splash);
    if (!win.isDestroyed()) {
      if (!win.isVisible()) {
        try {
          win.show();
        } catch {
          /* race teardown */
        }
      }
      win.moveTop();
      win.focus();
    }
  };

  const scheduleSplashDismiss = (): void => {
    if (splashDone || !splash) {
      finishSplash();
      return;
    }
    const delay = splashDismissDelayMs({
      shownAtMs: splashShownAt,
      nowMs: Date.now(),
      minVisibleMs: SPLASH_MIN_VISIBLE_MS,
    });
    clearSplashTimer();
    if (delay <= 0) {
      finishSplash();
      return;
    }
    splashTimer = setTimeout(finishSplash, delay);
  };

  const markBootDone = (result: unknown): void => {
    if (bootDone) return;
    bootDone = true;
    clearBootTimers();
    writeBootProbe(result);
    bootMark("hasMw");
    setSplashStage(splash, "messages_ready");
    scheduleSplashDismiss();
    try {
      opts?.onBootDone?.();
    } catch {
      /* dialog hooks must not break boot */
    }
  };

  const startSpaPoll = (): void => {
    if (pollStarted || bootDone) return;
    pollStarted = true;
    intervals.push(
      setInterval(() => {
        if (bootDone || win.isDestroyed()) return;
        void (async () => {
          const { result } = await probeMessagesSpa(win);
          if (spaProbeShowsReady(result)) markBootDone(result);
        })();
      }, SPLASH_SPA_POLL_MS)
    );
  };

  const navigateMessages = async (
    useLifecycle: boolean,
    reason: string
  ): Promise<void> => {
    if (win.isDestroyed() || navigating || bootDone) return;
    navigating = true;
    try {
      prepareMainWindowForMessagesLoad(win, {
        reveal: true,
        raise: !coverWithSplash,
      });
      if (coverWithSplash) raiseLaunchSplash(splash);
      if (useLifecycle) {
        console.warn("Messages lifecycle navigate:", reason);
        const ok = await navigateMessagesWithLifecycle(
          win.webContents,
          MESSAGES_WEB_URL
        );
        if (!ok && !win.isDestroyed()) {
          await loadMessagesUrl(win);
        }
      } else {
        await loadMessagesUrl(win);
      }
    } finally {
      navigating = false;
    }
  };

  const retryIfBlank = async (
    reason: string,
    forceLifecycle: boolean
  ): Promise<void> => {
    if (win.isDestroyed() || bootDone) return;
    const url = win.webContents.getURL();
    const { blank, result } = await probeMessagesSpa(win);
    if (spaProbeShowsReady(result)) {
      markBootDone(result);
      return;
    }
    // Never CDP-renavigate a live Messages shell that is merely slow.
    if (!shouldRetryMessagesLoad(url)) return;
    if (!blank) return;
    if (reloads >= maxReloads) {
      console.warn("Messages boot gave up after", reloads, "reloads;", reason);
      return;
    }
    reloads += 1;
    await navigateMessages(forceLifecycle, reason);
  };

  win.on("closed", () => {
    clearBootTimers();
    clearSplashTimer();
    finishSplash();
  });

  win.webContents.on("did-finish-load", () => {
    bootMark("did_finish_load");
    startSpaPoll();
    void (async () => {
      if (bootDone || win.isDestroyed() || navigating) return;
      const { blank, result } = await probeMessagesSpa(win);
      if (spaProbeShowsReady(result)) {
        markBootDone(result);
        return;
      }
      const url = win.webContents.getURL();
      if (!shouldRetryMessagesLoad(url)) return;
      if (!blank) return;
      if (reloads >= maxReloads) return;
      reloads += 1;
      await navigateMessages(true, `post-load blank (${url || "empty"})`);
    })();
  });

  for (const delay of MESSAGES_BLANK_RETRY_MS) {
    timers.push(
      setTimeout(() => {
        void retryIfBlank(`SPA still blank at ${delay}ms`, true);
      }, delay)
    );
  }

  if (splash) {
    setSplashStage(splash, "app_ready");
    raiseLaunchSplash(splash);
    splashRaiseTimer = setInterval(() => {
      if (!splashDone) raiseLaunchSplash(splash, { focus: false });
    }, 400);
    splashTimer = setTimeout(() => {
      finishSplash();
    }, SPLASH_FALLBACK_MS);
  }
}

/** Navigate to Messages; splash is dismissed by bindMessagesWebBoot when SPA-ready. */
export function loadMessagesWeb(
  win: BrowserWindow,
  opts?: { reveal?: boolean; splash?: BrowserWindow | null }
): void {
  const splash = opts?.splash ?? null;
  const cover = splash != null && !splash.isDestroyed();
  if (cover) setSplashStage(splash, "messages_loading");
  prepareMainWindowForMessagesLoad(win, {
    reveal: opts?.reveal !== false,
    raise: !cover,
  });
  if (cover) attachSplashToMain(splash, win);
  void loadMessagesUrl(win);
}

export function messagesDocumentReady(url: unknown): boolean {
  return isMessagesGoogleUrl(url);
}
