import "./helpers/portable";
import {
  app,
  Event as ElectronEvent,
  ipcMain,
  nativeImage,
  nativeTheme,
  powerMonitor,
  screen,
  shell,
} from "electron";
import { BrowserWindow } from "electron/main";
import path from "path";
import process from "process";
import {
  initProductUpdatePrefs,
  presentLaunchPrompts,
  setProductUpdateWindow,
} from "./helpers/productUpdateUi";
import { IS_DEV, IS_MAC, IS_WINDOWS, RESOURCES_PATH } from "./helpers/constants";
import { MenuManager } from "./helpers/menuManager";
import { setSettingsFlushEnabled, settings } from "./helpers/settings";
import { Conversation, TrayManager } from "./helpers/trayManager";
import {
  handleProtocolUrl,
  registerElectronProtocolClients,
  registerWindowsProtocolHandlers,
} from "./helpers/protocols";
import { maybeShowOnboarding, startSignInGuidance } from "./helpers/onboarding";
import {
  isAssociationOnlyMode,
  isOnboardingSampleUrl,
} from "./helpers/onboardingMode";
import { registerOsNotifyIpc, setNotifyConversations } from "./helpers/osNotification";
import { allowSessionPermission } from "./helpers/osNotificationLogic";
import { isDisplayCapturePermission, isMediaPermission } from "./helpers/mediaPermission";
import { confirmCallsMedia, confirmCallsScreenShare } from "./helpers/mediaPermissionUi";
import {
  allowMainFrameNavigate,
  allowOpenExternalUrl,
} from "./helpers/navigationAllowlist";
import { quietHoursActive } from "./helpers/quietHours";
import { shouldFlashTaskbar } from "./helpers/a11yMotion";
import { popupContextMenu } from "./menu/contextMenu";
import { bindPreferredDisplayMode } from "./helpers/bindDisplayRefresh";
import {
  initCrashCapture,
  presentPendingCrashIfAny,
} from "./helpers/crashCapture";
import { bindAppTheme } from "./helpers/settingsThemeUi";
import { bindAutostart } from "./helpers/autostart";
import { applyUnreadWindowChrome } from "./helpers/unreadChromeUi";
import { handleMainWindowClose } from "./helpers/closeBehaviorUi";
import { bindAlwaysOnTop, bindZoomPersist } from "./helpers/windowPrefsUi";
import {
  bindFoundInPage,
  registerFindInPageIpc,
} from "./helpers/findInPageUi";
import { shouldShowOfflineBanner } from "./helpers/loadFail";
import { clampWindowPosition } from "./helpers/clampWindow";
import { bindUserCss } from "./helpers/userCssUi";
import { bindDensityCss } from "./helpers/densityCssUi";
import { bindWrapperMuteHotkey } from "./helpers/muteHotkeyUi";
import { bindVerboseMainLog } from "./helpers/verboseLogUi";
import { bindAppLocale } from "./helpers/i18nUi";
import { bindRendererCrashReload } from "./helpers/rendererCrashUi";
import { bindDownloadLocation } from "./helpers/downloadsUi";
import { bindCertErrorInterstitial } from "./helpers/certErrorUi";
import { bindGuestSessionWipe, currentSessionPartition } from "./helpers/sessionProfileUi";
import { bindOsChromeTasks } from "./helpers/jumpListUi";
import { protocolLaunchFromArgv } from "./helpers/jumpList";
import { loadManagedPolicy } from "./helpers/managedPolicyUi";
import { parseThemePref, windowBackgroundForTheme } from "./helpers/settingsTheme";
import {
  SPLASH_FALLBACK_MS,
  shouldOpenSplash,
  shouldRevealMain,
} from "./helpers/splash";
import { dismissLaunchSplash, openLaunchSplash } from "./helpers/splashUi";
import fs from "fs";

const {
  autoHideMenuEnabled,
  trayEnabled,
  savedWindowSize,
  savedWindowPosition,
  taskbarFlashEnabled,
  spellCheckEnabled,
} = settings;

/** Preload is always emitted next to background.js under app/. */
const PRELOAD_BRIDGE = path.resolve(__dirname, "bridge.js");

function appWindowIcon() {
  const iconPath = path.resolve(RESOURCES_PATH, "icons", "256x256.png");
  const img = nativeImage.createFromPath(iconPath);
  return img.isEmpty() ? undefined : img;
}

let mainWindow: BrowserWindow;
let trayManager: TrayManager;
let pendingProtocolUrl: string | null = protocolLaunchFromArgv(process.argv);

if (settings.hardwareAccelerationEnabled.value === false) {
  app.disableHardwareAcceleration();
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    const proto = protocolLaunchFromArgv(commandLine);
    if (proto && (isAssociationOnlyMode() || isOnboardingSampleUrl(proto))) {
      // Defaults onboarding probe — do not steal focus to main / compose.
      console.log("Ignoring second-instance compose for onboarding probe");
      return;
    }
    if (mainWindow) {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
      mainWindow.focus();
      if (proto) {
        void handleProtocolUrl(mainWindow, proto);
      }
    } else if (proto) {
      pendingProtocolUrl = proto;
    }
  });

  app.on("open-url", (event, url) => {
    event.preventDefault();
    if (isAssociationOnlyMode() || isOnboardingSampleUrl(url)) {
      console.log("Ignoring open-url compose for onboarding probe");
      return;
    }
    if (mainWindow) {
      void handleProtocolUrl(mainWindow, url);
    } else {
      pendingProtocolUrl = url;
    }
  });
}

if (IS_MAC) {
  app.on("activate", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      app.dock?.setBadge("");
    }
  });
}

app.on("before-quit", () => {
  setSettingsFlushEnabled(false);
});

if (gotTheLock) {
  initCrashCapture();
  app.on("ready", () =>
    app.setAppUserModelId("com.edwardlthompson.google-messages")
  );

  app.on("ready", () => {
    bindAppLocale();
    const startInTray =
      settings.trayEnabled.value && settings.startInTrayEnabled.value;
    const splash = shouldOpenSplash(startInTray) ? openLaunchSplash() : null;
    setImmediate(() => {
    loadManagedPolicy();
    bindGuestSessionWipe();
    bindCertErrorInterstitial();
    void presentPendingCrashIfAny();
    registerElectronProtocolClients();

    trayManager = new TrayManager();

    new MenuManager();

    const { width, height } = savedWindowSize.value;
    let workArea = { x: 0, y: 0, width: 1920, height: 1080 };
    try {
      workArea = screen.getPrimaryDisplay().workArea;
    } catch {
      /* headless tests */
    }
    const clamped = clampWindowPosition(
      savedWindowPosition.value,
      { width, height },
      workArea
    );
    const { x, y } = clamped ?? {};
    const sessionPartition = currentSessionPartition();

    mainWindow = new BrowserWindow({
      width,
      height,
      x,
      y,
      autoHideMenuBar: autoHideMenuEnabled.value,
      title: "Google Messages",
      show: false,
      backgroundColor: windowBackgroundForTheme(
        parseThemePref(settings.themePreference.value),
        nativeTheme.shouldUseDarkColors,
        nativeTheme.shouldUseHighContrastColors
      ),
      icon: appWindowIcon(),
      titleBarStyle: IS_MAC ? "hiddenInset" : "default",
      ...(IS_WINDOWS && settings.windowsMicaEnabled.value
        ? { backgroundMaterial: "mica" as const }
        : {}),
      webPreferences: {
        preload: PRELOAD_BRIDGE,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        partition: sessionPartition,
        navigateOnDragDrop: false,
        autoplayPolicy: "user-gesture-required",
      },
    });

    process.env.MAIN_WINDOW_ID = mainWindow.id.toString();
    bindPreferredDisplayMode(mainWindow);
    bindAppTheme(mainWindow);
    bindAutostart();
    bindVerboseMainLog();
    bindRendererCrashReload(mainWindow);
    bindAlwaysOnTop(mainWindow);
    bindZoomPersist(mainWindow);
    bindFoundInPage(mainWindow);
    bindUserCss(mainWindow);
    bindDensityCss(mainWindow);
    bindWrapperMuteHotkey(mainWindow);
    bindOsChromeTasks(mainWindow);

    const session = mainWindow.webContents.session;
    session.setPermissionCheckHandler((wc, permission, requestingOrigin) => {
      const origin = requestingOrigin || wc?.getURL?.() || "";
      return allowSessionPermission(permission, origin);
    });
    session.setPermissionRequestHandler((wc, permission, callback, details) => {
      const origin = details?.requestingUrl || wc?.getURL?.() || "";
      if (!allowSessionPermission(permission, origin)) {
        callback(false);
        return;
      }
      if (isMediaPermission(permission)) {
        void confirmCallsMedia(mainWindow, permission, origin).then(callback);
        return;
      }
      if (isDisplayCapturePermission(permission)) {
        void confirmCallsScreenShare(mainWindow, permission, origin).then(
          callback
        );
        return;
      }
      callback(true);
    });
    bindDownloadLocation(session);

    initProductUpdatePrefs(app.getPath("userData"));
    setProductUpdateWindow(mainWindow);
    void presentLaunchPrompts();

    const blockingOnboarding = maybeShowOnboarding(mainWindow);
    if (blockingOnboarding) {
      dismissLaunchSplash(splash);
    } else {
      let revealed = false;
      const reveal = (): void => {
        if (revealed) return;
        revealed = true;
        dismissLaunchSplash(splash);
        if (
          shouldRevealMain({ blockingOnboarding, startInTray }) &&
          !mainWindow.isDestroyed()
        ) {
          mainWindow.show();
        }
      };
      mainWindow.once("ready-to-show", reveal);
      setTimeout(reveal, SPLASH_FALLBACK_MS);
    }

    mainWindow.loadURL("https://messages.google.com/web/");
    setImmediate(() => {
      registerWindowsProtocolHandlers();
    });

    mainWindow.webContents.once("did-finish-load", () => {
      if (pendingProtocolUrl) {
        const url = pendingProtocolUrl;
        pendingProtocolUrl = null;
        if (isAssociationOnlyMode() || isOnboardingSampleUrl(url)) {
          console.log("Dropping pending onboarding probe after load");
          return;
        }
        void handleProtocolUrl(mainWindow, url);
      }
    });

    trayManager.startIfEnabled();
    settings.showIconsInRecentConversationTrayEnabled.subscribe(() =>
      trayManager.refreshTrayMenu()
    );

    // Apply the spell-check preference on launch and whenever it is toggled.
    const applySpellLang = (lang: string): void => {
      try {
        mainWindow.webContents.session.setSpellCheckerLanguages([lang]);
      } catch {
        /* dictionary not installed on this OS */
      }
    };
    spellCheckEnabled.subscribe((enabled) => {
      mainWindow.webContents.session.setSpellCheckerEnabled(enabled);
      if (enabled) applySpellLang(settings.spellCheckLanguage.value);
    });
    settings.spellCheckLanguage.subscribe((lang) => {
      if (spellCheckEnabled.value) applySpellLang(lang);
    });

    let quitViaContext = false;
    app.on("before-quit", () => {
      quitViaContext = true;
    });

    mainWindow.on("close", (event: ElectronEvent) => {
      const { x, y, width, height } = mainWindow.getBounds();
      savedWindowPosition.next({ x, y });
      savedWindowSize.next({ width, height });

      if (handleMainWindowClose(mainWindow, quitViaContext) === "hide") {
        event.preventDefault();
        mainWindow.hide();
        trayManager?.showMinimizeToTrayWarning();

        if (IS_MAC) {
          app.dock?.hide();
        }
      } else {
        app.quit();
      }
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
      const url = details.url;
      const isGoogleAuthWindow = allowMainFrameNavigate(url);

      if (isGoogleAuthWindow) {
        return {
          action: "allow",
          overrideBrowserWindowOptions: {
            width: 500,
            height: 700,
            parent: mainWindow,
            modal: true,
            autoHideMenuBar: true,
            titleBarStyle: "default",
            webPreferences: {
              preload: PRELOAD_BRIDGE,
              contextIsolation: true,
              nodeIntegration: false,
              sandbox: false,
              partition: sessionPartition,
            },
          },
        };
      }

      if (allowOpenExternalUrl(url)) {
        void shell.openExternal(url);
      } else {
        console.warn("Blocked openExternal", url);
      }
      return { action: "deny" };
    });

    mainWindow.webContents.on("will-navigate", (event, url) => {
      if (!allowMainFrameNavigate(url)) {
        event.preventDefault();
        console.warn("Blocked navigation", url);
      }
    });

    mainWindow.webContents.on(
      "did-fail-load",
      (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        console.log("did-fail-load", {
          errorCode,
          errorDescription,
          validatedURL,
        });
        if (shouldShowOfflineBanner(errorCode, isMainFrame, errorDescription)) {
          mainWindow.webContents.send("show-offline-banner", {
            message: "Can't reach Google Messages. Check your connection.",
          });
        }
      }
    );

    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow.webContents.send("hide-offline-banner");
    });

    mainWindow.webContents.on(
      "did-redirect-navigation",
      (_event, url, isInPlace, isMainFrame) => {
        console.log("did-redirect-navigation", {
          url,
          isInPlace,
          isMainFrame,
        });
      }
    );

    mainWindow.webContents.on("console-message", (_event, level, message) => {
      console.log("renderer console:", level, message);
    });

    mainWindow.webContents.on("context-menu", popupContextMenu);

    if (!IS_DEV) {
      mainWindow.webContents.on("devtools-opened", () => {
        mainWindow.webContents.closeDevTools();
      });
      mainWindow.webContents.on("before-input-event", (event, input) => {
        const key = (input.key || "").toLowerCase();
        if (input.key === "F12" || (input.control && input.shift && key === "i")) {
          event.preventDefault();
        }
      });
    }

    // The Google Messages web app frequently ends up on a blank white screen
    // after the machine resumes from suspend: its connection to the phone is
    // dropped and it doesn't recover on its own. Reloading restores it without
    // the user needing to manually hit Ctrl+R. See issue #505.
    powerMonitor.on("resume", () => {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.reload();
      }
    });

    // The OS can also kill the renderer outright while suspended (memory
    // reclaim), which leaves the same blank screen. Reload to recover unless it
    // exited cleanly (e.g. during shutdown).
    mainWindow.webContents.on("render-process-gone", (_event, details) => {
      console.log("render-process-gone", details);
      if (details.reason !== "clean-exit" && !mainWindow.isDestroyed()) {
        mainWindow.webContents.reload();
      }
    });
    });
  });

  ipcMain.on("should-hide-notification-content", (event) => {
    event.returnValue = settings.hideNotificationContentEnabled.value;
  });

  registerOsNotifyIpc();
  registerFindInPageIpc();

  ipcMain.on("reload-main-window", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.reload();
    }
  });

  ipcMain.on("show-main-window", () => {
    mainWindow.show();
    mainWindow.focus();

    if (IS_MAC) {
      app.dock?.setBadge("");
    }
  });

  ipcMain.on("flash-main-window-if-not-focused", () => {
    if (
      quietHoursActive(
        new Date(),
        settings.quietHoursEnabled.value,
        settings.quietHoursPreset.value
      )
    ) {
      return;
    }
    if (
      !mainWindow.isFocused() &&
      shouldFlashTaskbar(
        taskbarFlashEnabled.value,
        settings.reduceMotionEnabled.value
      )
    ) {
      mainWindow.flashFrame(true);

      if (IS_MAC) {
        app.dock?.setBadge("•");
      }
    }
  });

  ipcMain.on("set-unread-status", (_event, unreadStatus: boolean) => {
    const unread = !!unreadStatus;
    trayManager.setUnread(unread);
    applyUnreadWindowChrome(mainWindow, unread);
  });

  ipcMain.on("set-recent-conversations", (_event, data: Conversation[]) => {
    trayManager.setRecentConversations(data);
    setNotifyConversations(data);
  });

  ipcMain.handle("get-icon", () => {
    const bitmap = fs.readFileSync(
      path.resolve(RESOURCES_PATH, "icons", "64x64.png")
    );

    return Buffer.from(bitmap).toString("base64");
  });
}
