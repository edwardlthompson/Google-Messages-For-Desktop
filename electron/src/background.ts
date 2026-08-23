import "./helpers/portable";
import {
  app,
  Event as ElectronEvent,
  ipcMain,
  nativeImage,
  powerMonitor,
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
import { IS_MAC, RESOURCES_PATH } from "./helpers/constants";
import { MenuManager } from "./helpers/menuManager";
import { setSettingsFlushEnabled, settings } from "./helpers/settings";
import { Conversation, TrayManager } from "./helpers/trayManager";
import {
  findProtocolArg,
  handleProtocolUrl,
  registerElectronProtocolClients,
  registerWindowsProtocolHandlers,
} from "./helpers/protocols";
import { maybeShowOnboarding, startSignInGuidance } from "./helpers/onboarding";
import {
  isAssociationOnlyMode,
  isOnboardingSampleUrl,
} from "./helpers/onboardingMode";
import { registerOsNotifyIpc } from "./helpers/osNotification";
import { allowSessionPermission } from "./helpers/osNotificationLogic";
import { popupContextMenu } from "./menu/contextMenu";
import { bindPreferredDisplayMode } from "./helpers/bindDisplayRefresh";
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
let pendingProtocolUrl: string | null = findProtocolArg(process.argv);

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    const proto = findProtocolArg(commandLine);
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
  app.on("ready", () =>
    app.setAppUserModelId("com.edwardlthompson.google-messages")
  );

  app.on("ready", () => {
    registerElectronProtocolClients();
    registerWindowsProtocolHandlers();

    trayManager = new TrayManager();

    new MenuManager();

    const { width, height } = savedWindowSize.value;
    const { x, y } = savedWindowPosition.value ?? {};

    mainWindow = new BrowserWindow({
      width,
      height,
      x,
      y,
      autoHideMenuBar: autoHideMenuEnabled.value,
      title: "Google Messages",
      show: false,
      icon: appWindowIcon(),
      titleBarStyle: IS_MAC ? "hiddenInset" : "default",
      webPreferences: {
        preload: PRELOAD_BRIDGE,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        partition: "persist:main",
      },
    });

    process.env.MAIN_WINDOW_ID = mainWindow.id.toString();
    bindPreferredDisplayMode(mainWindow);

    const session = mainWindow.webContents.session;
    session.setPermissionCheckHandler((wc, permission, requestingOrigin) => {
      const origin = requestingOrigin || wc?.getURL?.() || "";
      return allowSessionPermission(permission, origin);
    });
    session.setPermissionRequestHandler((wc, permission, callback, details) => {
      const origin = details?.requestingUrl || wc?.getURL?.() || "";
      callback(allowSessionPermission(permission, origin));
    });

    initProductUpdatePrefs(app.getPath("userData"));
    setProductUpdateWindow(mainWindow);
    void presentLaunchPrompts();

    const blockingOnboarding = maybeShowOnboarding(mainWindow);
    if (
      !blockingOnboarding &&
      !(settings.trayEnabled.value && settings.startInTrayEnabled.value)
    ) {
      mainWindow.show();
    }

    mainWindow.loadURL("https://messages.google.com/web/");

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
    spellCheckEnabled.subscribe((enabled) =>
      mainWindow.webContents.session.setSpellCheckerEnabled(enabled)
    );

    let quitViaContext = false;
    app.on("before-quit", () => {
      quitViaContext = true;
    });

    const shouldExitOnMainWindowClosed = () => {
      if (IS_MAC) {
        return quitViaContext;
      }

      if (trayEnabled.value) {
        return quitViaContext;
      }

      return true;
    };

    mainWindow.on("close", (event: ElectronEvent) => {
      const { x, y, width, height } = mainWindow.getBounds();
      savedWindowPosition.next({ x, y });
      savedWindowSize.next({ width, height });

      if (!shouldExitOnMainWindowClosed()) {
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

      const allowedGoogleHosts = new Set([
        "accounts.google.com",
        "google.com",
        "www.google.com",
        "messages.google.com",
      ]);
      let isGoogleAuthWindow = false;
      try {
        const host = new URL(url).hostname.toLowerCase();
        isGoogleAuthWindow =
          allowedGoogleHosts.has(host) ||
          [...allowedGoogleHosts].some(
            (h) => host === h || host.endsWith(`.${h}`)
          );
        // Narrow: only https Google auth/messages hosts
        if (!url.startsWith("https://")) isGoogleAuthWindow = false;
      } catch {
        isGoogleAuthWindow = false;
      }

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
              partition: "persist:main",
            },
          },
        };
      }

      // F-001: never open arbitrary schemes from the SPA (file:, javascript:, etc.)
      try {
        const parsed = new URL(url);
        if (parsed.protocol === "https:" || parsed.protocol === "mailto:") {
          void shell.openExternal(url);
        } else {
          console.warn("Blocked openExternal for scheme", parsed.protocol, url);
        }
      } catch {
        console.warn("Blocked openExternal for invalid URL", url);
      }
      return { action: "deny" };
    });

    mainWindow.webContents.on(
      "did-fail-load",
      (_event, errorCode, errorDescription, validatedURL) => {
        console.log("did-fail-load", {
          errorCode,
          errorDescription,
          validatedURL,
        });
      }
    );

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

  ipcMain.on("should-hide-notification-content", (event) => {
    event.returnValue = settings.hideNotificationContentEnabled.value;
  });

  registerOsNotifyIpc();

  ipcMain.on("show-main-window", () => {
    mainWindow.show();
    mainWindow.focus();

    if (IS_MAC) {
      app.dock?.setBadge("");
    }
  });

  ipcMain.on("flash-main-window-if-not-focused", () => {
    if (!mainWindow.isFocused() && taskbarFlashEnabled.value) {
      mainWindow.flashFrame(true);

      if (IS_MAC) {
        app.dock?.setBadge("•");
      }
    }
  });

  ipcMain.on("set-unread-status", (_event, unreadStatus: boolean) => {
    trayManager.setUnread(unreadStatus);
  });

  ipcMain.on("set-recent-conversations", (_event, data: Conversation[]) => {
    trayManager.setRecentConversations(data);
  });

  ipcMain.handle("get-icon", () => {
    const bitmap = fs.readFileSync(
      path.resolve(RESOURCES_PATH, "icons", "64x64.png")
    );

    return Buffer.from(bitmap).toString("base64");
  });
}
