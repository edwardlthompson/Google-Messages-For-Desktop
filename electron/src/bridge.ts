import { contextBridge, ipcRenderer, webFrame } from "electron";

import { INITIAL_ICON_IMAGE, IS_MAC, IS_WINDOWS } from "./preload/constants_preload";
import {
  createRecentThreadObserver,
  createUnreadObserver,
  ensureConversationObservers,
  focusFunctions,
  recentThreadObserver,
} from "./preload/observers";

declare global {
  interface Window {
    interop: {
      show_main_window: () => void;
      flash_main: () => void;
      should_hide: () => boolean;
      get_icon: () => Promise<string>;
      os_notify: (payload: { title?: string; body?: string }) => void;
      preload_init: () => void;
    };
  }
}

const preload_init = () => {
  if (IS_MAC) {
    const titlebarStyle = `:root {
        --amd-titlebar-height: 28px;
      }

      body {
        overflow: hidden;
      }

      mw-app {
        display: block;
        height: calc(100vh - var(--amd-titlebar-height));
        overflow: hidden;
        transform: translateY(var(--amd-titlebar-height));
      }

      #amd-titlebar {
        -webkit-app-region: drag;
        position: fixed;
        height: var(--amd-titlebar-height);
        top: 0;
        left: 0;
        right: 0;
        background: none;
        pointer-events: none;
        z-index: 2147483647;
      }

      button,
      a,
      input,
      textarea,
      select,
      [role="button"],
      [role="link"],
      [tabindex] {
        -webkit-app-region: no-drag;
      }`;

    document.body.appendChild(
      Object.assign(document.createElement("style"), {
        textContent: titlebarStyle,
      })
    );

    const titlebar = document.createElement("div");
    titlebar.id = "amd-titlebar";
    document.querySelector("mw-app")?.parentNode?.prepend(titlebar);
  }

  const conversationListObserver = new MutationObserver(() => {
    if (ensureConversationObservers()) {
      createUnreadObserver();
      createRecentThreadObserver();

      // keep trying to get an image that isnt blank until they load
      const interval = setInterval(() => {
        ensureConversationObservers();
        const conversation = document.body.querySelector(
          "mws-conversation-list-item"
        );
        if (conversation) {
          const canvas = conversation.querySelector(
            "a div.avatar-container canvas"
          ) as HTMLCanvasElement | null;

          if (canvas != null && canvas.toDataURL() != INITIAL_ICON_IMAGE) {
            recentThreadObserver();
            // refresh for profile image loads after letter loads.
            setTimeout(recentThreadObserver, 3000);
            clearInterval(interval);
          }
        }
      }, 250);
      // Stay connected: remount detection via ensureConversationObservers on mutations
    }

    ensureConversationObservers();

    const title = document.head.querySelector("title");
    if (title != null) {
      title.innerText = "Google Messages";
    }
  });

  conversationListObserver.observe(document.body, {
    attributes: false,
    subtree: true,
    childList: true,
  });
  ensureConversationObservers();
};

ipcRenderer.on("focus-conversation", (_event, i) => {
  if (typeof i !== "number" || !Number.isInteger(i) || i < 0) {
    return;
  }
  const fn = focusFunctions[i];
  if (typeof fn === "function") {
    fn();
  }
});

contextBridge.exposeInMainWorld("interop", {
  show_main_window: () => {
    ipcRenderer.send("show-main-window");
  },
  flash_main: () => {
    ipcRenderer.send("flash-main-window-if-not-focused");
  },
  should_hide: () => {
    return ipcRenderer.sendSync("should-hide-notification-content");
  },
  get_icon: async () => {
    const data = await ipcRenderer.invoke("get-icon");
    return `data:image/png;base64,${data}`;
  },
  os_notify: (payload: { title?: string; body?: string }) => {
    ipcRenderer.send("os-notify", payload ?? {});
  },
  preload_init,
});
webFrame.executeJavaScript(`
  window.addEventListener("load", async () => {
    window.interop.preload_init();
    window.icon_data_uri = await window.interop.get_icon();
  });
`);

const useOsNotifyOnly = IS_WINDOWS;

webFrame.executeJavaScript(`
(function () {
  const useOsNotifyOnly = ${useOsNotifyOnly ? "true" : "false"};
  window.OldNotification = window.Notification;
  window.Notification = function (title, options) {
    const stub = function () {
      return {
        close: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        onclick: null,
        onclose: null,
        onerror: null,
        onshow: null,
      };
    };
    try {
      const hideContent = window.interop.should_hide();
      const isDataImage = (v) =>
        typeof v === "string" && v.startsWith("data:image/");
      const safeIcon = (...candidates) => {
        for (const c of candidates) {
          if (isDataImage(c)) return c;
        }
        return undefined;
      };

      const body = hideContent
        ? "Click to open"
        : options?.body || "";
      const newTitle = hideContent ? "New Message" : title || "Google Messages";

      if (useOsNotifyOnly) {
        window.interop.os_notify({
          title: newTitle,
          body: body || "New message",
        });
        window.interop.flash_main();
        return stub();
      }

      const notificationOpts = hideContent
        ? {
            body: "Click to open",
            icon: safeIcon(window.icon_data_uri),
          }
        : {
            body: options?.body || "",
            icon: safeIcon(options?.icon, window.icon_data_uri),
          };

      try {
        const notification = new window.OldNotification(newTitle, notificationOpts);
        notification.addEventListener("click", () => {
          window.interop.show_main_window();
          document.dispatchEvent(new Event("focus"));
        });
        window.interop.flash_main();
        return notification;
      } catch (inner) {
        console.error("HTML5 Notification failed; falling back to OS notify", inner);
        window.interop.os_notify({
          title: newTitle,
          body: body || "New message",
        });
        window.interop.flash_main();
        return stub();
      }
    } catch (e) {
      console.error(e);
      console.trace();
      try {
        // Outer catch may have failed before hide-content ran — never
        // forward raw page title/body. Main process re-sanitizes.
        window.interop.os_notify({ title: "", body: "" });
        window.interop.flash_main();
      } catch (fallbackErr) {
        console.error("os_notify fallback failed", fallbackErr);
      }
      return stub();
    }
  };

  window.Notification.permission = "granted";
  window.Notification.requestPermission = async () => "granted";
})();
`);
contextBridge.exposeInMainWorld("module", { exports: null });
