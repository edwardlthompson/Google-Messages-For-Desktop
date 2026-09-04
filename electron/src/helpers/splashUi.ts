import { BrowserWindow, nativeImage } from "electron";
import os from "os";
import path from "path";
import { pathToFileURL } from "url";
import { RESOURCES_PATH } from "./constants";
import { bootMark } from "./bootTiming";
import {
  buildSplashQuery,
  splashResourceFiles,
  stageSplashFiles,
} from "./splashLoad";
import {
  SPLASH_BACKGROUND,
  SPLASH_CHROME_WAIT_MS,
  SPLASH_HEIGHT,
  SPLASH_SHOW_FALLBACK_MS,
  SPLASH_WIDTH,
} from "./splash";
import { splashCopy } from "./splashCopy";
import {
  nextSplashStage,
  type SplashStage,
} from "./splashStages";

function splashCopyQuery() {
  return {
    heading: splashCopy["splash.heading"],
    lede: splashCopy["splash.lede"],
    labelApp: splashCopy["splash.stage.app"],
    labelAppDone: splashCopy["splash.stage.app_loaded"],
    labelMsg: splashCopy["splash.stage.messages"],
    labelMsgDone: splashCopy["splash.stage.messages_ready"],
    hint: splashCopy["splash.stage.hint"],
  };
}

function splashIcon() {
  const iconPath = path.resolve(RESOURCES_PATH, "icons", "256x256.png");
  const img = nativeImage.createFromPath(iconPath);
  return img.isEmpty() ? undefined : img;
}

function splashLoadTarget() {
  const copy = splashCopyQuery();
  try {
    return stageSplashFiles(
      RESOURCES_PATH,
      path.join(os.tmpdir(), `gmfd-splash-${process.pid}`),
      copy
    );
  } catch (err) {
    console.warn("splash stage failed", err);
    const files = splashResourceFiles(RESOURCES_PATH);
    return {
      htmlPath: files.html,
      query: buildSplashQuery(
        copy,
        pathToFileURL(files.hero).href,
        pathToFileURL(files.logo).href
      ),
    };
  }
}

const splashDomReady = new WeakSet<BrowserWindow>();
const splashPendingStage = new WeakMap<BrowserWindow, SplashStage>();
const splashChromeReady = new WeakMap<BrowserWindow, Promise<void>>();

function pushStageToRenderer(win: BrowserWindow, stage: SplashStage): void {
  void win.webContents
    .executeJavaScript(
      `typeof setSplashStage==="function"?setSplashStage(${JSON.stringify(stage)}):null`,
      true
    )
    .catch(() => {});
}

/** Resolves when splash HTML (stage bar) has parsed, or after a short cap. */
export function whenSplashChromeReady(
  win: BrowserWindow | null
): Promise<void> {
  if (!win || win.isDestroyed()) return Promise.resolve();
  return splashChromeReady.get(win) ?? Promise.resolve();
}

/**
 * Branded cover before Messages starts. Small HTML first (progress bar),
 * JPEG hero via sibling file URL — never about:blank + document.write.
 */
export function openLaunchSplash(): BrowserWindow {
  const staged = splashLoadTarget();
  const win = new BrowserWindow({
    width: SPLASH_WIDTH,
    height: SPLASH_HEIGHT,
    show: true,
    frame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    backgroundColor: SPLASH_BACKGROUND,
    title: splashCopy["splash.heading"],
    icon: splashIcon(),
    center: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });
  try {
    win.setAlwaysOnTop(true, "screen-saver");
  } catch {
    try {
      win.setAlwaysOnTop(true);
    } catch {
      /* ignore */
    }
  }

  let resolved = false;
  let resolveChrome: () => void = () => {};
  splashChromeReady.set(
    win,
    new Promise<void>((resolve) => {
      resolveChrome = resolve;
    })
  );
  const finish = (): void => {
    if (resolved) return;
    resolved = true;
    if (!win.isDestroyed()) {
      splashDomReady.add(win);
      const pending = splashPendingStage.get(win) ?? "app_loading";
      pushStageToRenderer(win, pending);
    }
    bootMark("splash_chrome_ready");
    resolveChrome();
  };
  win.webContents.once("dom-ready", finish);
  win.webContents.once("did-finish-load", finish);
  setTimeout(finish, SPLASH_CHROME_WAIT_MS);

  const show = (): void => {
    if (!win.isDestroyed() && !win.isVisible()) win.show();
  };
  win.once("ready-to-show", show);
  setTimeout(show, SPLASH_SHOW_FALLBACK_MS);
  void win.loadFile(staged.htmlPath, { query: staged.query }).catch((err) => {
    console.warn("splash loadFile failed", err);
    finish();
  });
  bootMark("splash_open");
  raiseLaunchSplash(win);
  return win;
}

/** Push a monotonic stage into the splash renderer (no-op if gone). */
export function setSplashStage(
  win: BrowserWindow | null,
  stage: SplashStage
): void {
  if (!win || win.isDestroyed()) return;
  const prev = splashPendingStage.get(win) ?? null;
  const applied = nextSplashStage(prev, stage);
  splashPendingStage.set(win, applied);
  bootMark(`splash_${applied}`);
  if (!splashDomReady.has(win)) return;
  pushStageToRenderer(win, applied);
}

export function dismissLaunchSplash(win: BrowserWindow | null): void {
  if (!win || win.isDestroyed()) return;
  try {
    win.setAlwaysOnTop(false);
    win.setParentWindow(null);
  } catch {
    /* race teardown */
  }
  bootMark("splash_dismiss");
  splashDomReady.delete(win);
  splashPendingStage.delete(win);
  splashChromeReady.delete(win);
  win.close();
}

/** Keep splash above the main window after it is created. */
export function attachSplashToMain(
  splash: BrowserWindow | null,
  main: BrowserWindow | null
): void {
  if (!splash || !main || splash.isDestroyed() || main.isDestroyed()) return;
  try {
    splash.setParentWindow(main);
  } catch {
    /* platform may ignore */
  }
  raiseLaunchSplash(splash, { focus: true });
}

export function raiseLaunchSplash(
  win: BrowserWindow | null,
  opts?: { focus?: boolean }
): void {
  if (!win || win.isDestroyed()) return;
  try {
    win.setAlwaysOnTop(true, "screen-saver");
  } catch {
    try {
      win.setAlwaysOnTop(true);
    } catch {
      /* ignore */
    }
  }
  if (!win.isVisible()) win.show();
  try {
    win.moveTop();
    if (opts?.focus !== false) win.focus();
  } catch {
    /* ignore */
  }
}
