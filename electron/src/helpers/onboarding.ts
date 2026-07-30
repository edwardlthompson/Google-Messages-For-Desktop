import { app, BrowserWindow, ipcMain, shell } from "electron";
import fs from "fs";
import path from "path";
import { IS_LINUX, IS_MAC, IS_WINDOWS, RESOURCES_PATH } from "./constants";
import {
  allDefaultsSet,
  getDefaultHandlerStatus,
} from "./defaultHandlers";
import {
  ONBOARDING_SAMPLE_NUMBER,
  setAssociationOnlyMode,
} from "./onboardingMode";
import { APP_REG_NAME, PROTOCOL_SCHEMES } from "./protocols";
import { settings } from "./settings";

export const DONATE_VENMO_URL =
  "https://venmo.com/code?user_id=1857304970395648420";

let onboardingWindow: BrowserWindow | null = null;
let signInWindow: BrowserWindow | null = null;
let ipcRegistered = false;
let boundMainWindow: BrowserWindow | null = null;
let clickedSchemes = new Set<string>();

/** URI that opens Default apps focused on this app (Win11 22H2+ with CU). */
export function defaultAppsDeepLink(): string {
  const appKey = encodeURIComponent(APP_REG_NAME);
  return `ms-settings:defaultapps?registeredAppUser=${appKey}`;
}

export function defaultAppsSearchLink(): string {
  return `ms-settings:search?query=${encodeURIComponent("Google Messages")}`;
}

export function openOsDefaultAppsSettings(): void {
  if (IS_WINDOWS) {
    void shell.openExternal(defaultAppsDeepLink());
    return;
  }
  if (IS_MAC) {
    // Opens System Settings; user navigates to Default apps / messaging.
    void shell.openExternal(
      "x-apple.systempreferences:com.apple.preference.defaultapp"
    );
    return;
  }
  if (IS_LINUX) {
    // Best-effort desktop settings; users also use distro Default Applications UI.
    void shell.openExternal("settings://default-apps").catch(() => undefined);
  }
}

export function openWindowsDefaultAppsSettings(): void {
  openOsDefaultAppsSettings();
}

export function openDonatePage(): void {
  void shell.openExternal(DONATE_VENMO_URL);
}

function minimizeOnboardingForSettings(): void {
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    onboardingWindow.setAlwaysOnTop(false);
    if (onboardingWindow.isMinimizable()) {
      onboardingWindow.minimize();
    }
  }
}

function restoreOnboarding(): void {
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    if (onboardingWindow.isMinimized()) onboardingWindow.restore();
    onboardingWindow.show();
    onboardingWindow.focus();
  }
}

function preloadPath(): string {
  const candidates = [
    path.resolve(app.getAppPath(), "app", "onboarding-bridge.js"),
    path.resolve(app.getAppPath(), "onboarding-bridge.js"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

function sampleUrlForScheme(scheme: string): string {
  if (scheme === "im") return `im:${ONBOARDING_SAMPLE_NUMBER}`;
  return `${scheme}:${ONBOARDING_SAMPLE_NUMBER}`;
}

function checklistPayload() {
  if (IS_WINDOWS) {
    const status = getDefaultHandlerStatus();
    return {
      platform: "win32" as const,
      status,
      allSet: allDefaultsSet(status),
      sampleNumber: ONBOARDING_SAMPLE_NUMBER,
      mode: "userchoice" as const,
    };
  }
  const status = {} as Record<string, boolean>;
  for (const scheme of PROTOCOL_SCHEMES) {
    status[scheme] = clickedSchemes.has(scheme);
  }
  const allSet = PROTOCOL_SCHEMES.every((s) => clickedSchemes.has(s));
  return {
    platform: process.platform,
    status,
    allSet,
    sampleNumber: ONBOARDING_SAMPLE_NUMBER,
    mode: "clicked" as const,
  };
}

function finishDefaultsOnboarding(mainWindow: BrowserWindow): void {
  setAssociationOnlyMode(false);
  settings.onboardingCompleted.next(true);
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    onboardingWindow.close();
  }
  onboardingWindow = null;
  if (!mainWindow.isDestroyed()) {
    if (!(settings.trayEnabled.value && settings.startInTrayEnabled.value)) {
      mainWindow.show();
    }
    mainWindow.focus();
  }
  if (!settings.signInGuidanceCompleted.value) {
    startSignInGuidance(mainWindow);
  }
}

function ensureIpc(mainWindow: BrowserWindow): void {
  boundMainWindow = mainWindow;
  if (ipcRegistered) return;
  ipcRegistered = true;

  ipcMain.on("gmfd-onboarding-open-settings", () => {
    minimizeOnboardingForSettings();
    openOsDefaultAppsSettings();
  });

  ipcMain.on("gmfd-onboarding-open-search", () => {
    minimizeOnboardingForSettings();
    if (IS_WINDOWS) {
      void shell.openExternal(defaultAppsSearchLink());
    } else {
      openOsDefaultAppsSettings();
    }
  });

  ipcMain.on("gmfd-onboarding-minimize", () => {
    minimizeOnboardingForSettings();
  });

  ipcMain.on("gmfd-onboarding-open-protocol", (_event, scheme: string) => {
    if (!PROTOCOL_SCHEMES.includes(scheme as (typeof PROTOCOL_SCHEMES)[number])) {
      return;
    }
    clickedSchemes.add(scheme);
    const url = sampleUrlForScheme(scheme);
    setAssociationOnlyMode(true);
    minimizeOnboardingForSettings();
    void shell.openExternal(url);
    setTimeout(() => {
      restoreOnboarding();
      onboardingWindow?.webContents.send("gmfd-onboarding-refresh-defaults");
    }, 2500);
  });

  ipcMain.handle("gmfd-onboarding-check-defaults", () => checklistPayload());

  ipcMain.on("gmfd-onboarding-complete", () => {
    if (boundMainWindow && !boundMainWindow.isDestroyed()) {
      finishDefaultsOnboarding(boundMainWindow);
    }
  });

  ipcMain.on("gmfd-onboarding-skip", () => {
    if (boundMainWindow && !boundMainWindow.isDestroyed()) {
      finishDefaultsOnboarding(boundMainWindow);
    }
  });

  ipcMain.on("gmfd-signin-dismiss", () => {
    settings.signInGuidanceCompleted.next(true);
    if (signInWindow && !signInWindow.isDestroyed()) signInWindow.close();
    signInWindow = null;
  });

  ipcMain.on("gmfd-signin-verify-protocol", () => {
    if (!boundMainWindow || boundMainWindow.isDestroyed()) return;
    settings.signInGuidanceCompleted.next(true);
    if (signInWindow && !signInWindow.isDestroyed()) signInWindow.close();
    signInWindow = null;
    setAssociationOnlyMode(false);
    void shell.openExternal(`sms:${ONBOARDING_SAMPLE_NUMBER}`);
  });

  ipcMain.on("gmfd-open-donate", () => {
    openDonatePage();
  });
}

function wireOnboardingNavigation(win: BrowserWindow): void {
  const openSampleOnly = (url: string): void => {
    const m = url.trim().match(/^(sms|tel|smsto|callto|im):/i);
    if (!m) return;
    const scheme = m[1].toLowerCase();
    if (!PROTOCOL_SCHEMES.includes(scheme as (typeof PROTOCOL_SCHEMES)[number])) {
      return;
    }
    clickedSchemes.add(scheme);
    setAssociationOnlyMode(true);
    minimizeOnboardingForSettings();
    void shell.openExternal(sampleUrlForScheme(scheme));
    setTimeout(() => restoreOnboarding(), 2500);
  };

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(sms|tel|smsto|callto|im):/i.test(url)) {
      openSampleOnly(url);
    }
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (/^(sms|tel|smsto|callto|im):/i.test(url)) {
      event.preventDefault();
      openSampleOnly(url);
    } else if (!url.startsWith("file:")) {
      event.preventDefault();
    }
  });
}

/**
 * Stage A — OS defaults. Returns true if blocking main reveal.
 */
export function maybeShowOnboarding(mainWindow: BrowserWindow): boolean {
  if (settings.onboardingCompleted.value) {
    if (!settings.signInGuidanceCompleted.value) {
      // Defer until main has a URL — caller shows main then we attach.
      setTimeout(() => startSignInGuidance(mainWindow), 800);
    }
    return false;
  }

  ensureIpc(mainWindow);
  setAssociationOnlyMode(true);
  clickedSchemes = new Set();

  onboardingWindow = new BrowserWindow({
    width: 820,
    height: 920,
    show: false,
    resizable: true,
    minimizable: true,
    maximizable: false,
    fullscreenable: false,
    title: "Welcome — Google Messages",
    autoHideMenuBar: true,
    alwaysOnTop: false,
    center: true,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  wireOnboardingNavigation(onboardingWindow);

  const html = path.resolve(RESOURCES_PATH, "onboarding.html");
  void onboardingWindow.loadFile(html);

  onboardingWindow.once("ready-to-show", () => {
    onboardingWindow?.show();
    onboardingWindow?.focus();
  });

  onboardingWindow.on("focus", () => {
    onboardingWindow?.webContents.send("gmfd-onboarding-refresh-defaults");
  });

  onboardingWindow.on("closed", () => {
    onboardingWindow = null;
    setAssociationOnlyMode(false);
    if (!settings.onboardingCompleted.value) {
      settings.onboardingCompleted.next(true);
      if (
        boundMainWindow &&
        !boundMainWindow.isDestroyed() &&
        !settings.signInGuidanceCompleted.value
      ) {
        startSignInGuidance(boundMainWindow);
      }
    }
    if (
      !mainWindow.isDestroyed() &&
      !(settings.trayEnabled.value && settings.startInTrayEnabled.value)
    ) {
      mainWindow.show();
    }
  });

  return true;
}

/** Stage B — sign-in / pair phone guidance beside the main window. */
export function startSignInGuidance(mainWindow: BrowserWindow): void {
  if (settings.signInGuidanceCompleted.value) return;
  if (signInWindow && !signInWindow.isDestroyed()) {
    signInWindow.focus();
    return;
  }

  ensureIpc(mainWindow);

  if (!mainWindow.isDestroyed()) {
    if (!(settings.trayEnabled.value && settings.startInTrayEnabled.value)) {
      mainWindow.show();
    }
  }

  signInWindow = new BrowserWindow({
    width: 480,
    height: 520,
    show: false,
    resizable: true,
    minimizable: true,
    parent: mainWindow.isDestroyed() ? undefined : mainWindow,
    modal: false,
    title: "Sign in — Google Messages",
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  void signInWindow.loadFile(path.resolve(RESOURCES_PATH, "signin-guidance.html"));
  signInWindow.once("ready-to-show", () => {
    signInWindow?.show();
    signInWindow?.focus();
  });
  // Poll for signed-in SPA and enable verify step in the guidance window.
  const timer = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      clearInterval(timer);
      return;
    }
    void mainWindow.webContents
      .executeJavaScript(
        `(() => {
          const href = location.href || '';
          if (/accounts\\.google\\.com/i.test(href)) return { signedIn: false, reason: 'accounts' };
          if (/messages\\.google\\.com\\/web\\/?$/i.test(href) && document.querySelector('img[alt*="QR"], canvas, [data-e2e-qr]')) {
            return { signedIn: false, reason: 'qr' };
          }
          const hasList = !!(
            document.querySelector('[data-e2e-conversation-list], mw-conversation-list, mws-conversations-list') ||
            document.querySelector('a[href*="/conversations/"]')
          );
          const bodyText = (document.body && document.body.innerText) || '';
          if (/scan the qr code|link your phone|sign in/i.test(bodyText) && !hasList) {
            return { signedIn: false, reason: 'prompt' };
          }
          return { signedIn: hasList || /\\/conversations/i.test(href), reason: hasList ? 'list' : 'url' };
        })()`
      )
      .then((result: { signedIn?: boolean }) => {
        if (signInWindow && !signInWindow.isDestroyed()) {
          signInWindow.webContents.send(
            "gmfd-signin-status",
            result?.signedIn === true
          );
        }
      })
      .catch(() => undefined);
  }, 2500);

  signInWindow.on("closed", () => {
    clearInterval(timer);
    signInWindow = null;
    if (!settings.signInGuidanceCompleted.value) {
      settings.signInGuidanceCompleted.next(true);
    }
  });
}

/** Re-open Stage A defaults wizard from the menu. */
export function showOnboardingAgain(mainWindow: BrowserWindow): void {
  settings.onboardingCompleted.next(false);
  clickedSchemes = new Set();
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    restoreOnboarding();
    onboardingWindow.webContents.send("gmfd-onboarding-refresh-defaults");
    return;
  }
  maybeShowOnboarding(mainWindow);
}
