import { MenuItemConstructorOptions, shell } from "electron";
import path from "path";
import { IS_MAC, IS_WINDOWS, RESOURCES_PATH } from "../helpers/constants";
import { VENMO_DONATE_URL } from "../helpers/donate";
import { openDownloadsFolder } from "../helpers/downloadsUi";
import { menuCopy } from "../helpers/menuCopy";
import { protocolTestLinksPath } from "../helpers/protocols";
import { aboutMenuItem } from "./items/about";
import { reportBugMenuItem, requestFeatureMenuItem } from "./items/feedback";
import { checkForUpdatesMenuItem } from "./items/updates";
import { separator } from "./items/separator";

export function helpMenuTemplate(): MenuItemConstructorOptions {
  const submenu: MenuItemConstructorOptions[] = [
    {
      label: menuCopy["menu.protocol_tests"],
      click: async (): Promise<void> => {
        const fileUrl = `file:///${protocolTestLinksPath().replace(/\\/g, "/")}`;
        await shell.openExternal(fileUrl);
      },
    },
    {
      label: menuCopy["menu.troubleshooting"],
      click: async (): Promise<void> => {
        const fileUrl = `file:///${path
          .resolve(RESOURCES_PATH, "troubleshooting.html")
          .replace(/\\/g, "/")}`;
        await shell.openExternal(fileUrl);
      },
    },
    {
      label: menuCopy["menu.whats_new"],
      click: async (): Promise<void> => {
        const fileUrl = `file:///${path
          .resolve(RESOURCES_PATH, "whats-new.html")
          .replace(/\\/g, "/")}`;
        await shell.openExternal(fileUrl);
      },
    },
    {
      label: menuCopy["menu.shortcuts"],
      click: async (): Promise<void> => {
        const fileUrl = `file:///${path
          .resolve(RESOURCES_PATH, "shortcuts.html")
          .replace(/\\/g, "/")}`;
        await shell.openExternal(fileUrl);
      },
    },
    {
      label: menuCopy["menu.open_downloads"],
      click: (): void => openDownloadsFolder(),
    },
    {
      label: menuCopy["menu.donate"],
      click: async (): Promise<void> => {
        await shell.openExternal(VENMO_DONATE_URL);
      },
    },
    {
      label: menuCopy["menu.learn_more"],
      click: async (): Promise<void> =>
        await shell.openExternal(
          "https://github.com/edwardlthompson/Google-Messages-For-Desktop"
        ),
    },
    {
      label: menuCopy["menu.upstream"],
      click: async (): Promise<void> =>
        await shell.openExternal(
          "https://github.com/OrangeDrangon/android-messages-desktop/"
        ),
    },
  ];

  if (IS_WINDOWS) {
    submenu.push(separator);
    submenu.push(checkForUpdatesMenuItem());
  }

  submenu.push(separator);
  submenu.push(reportBugMenuItem());
  submenu.push(requestFeatureMenuItem());

  if (!IS_MAC) {
    submenu.push(separator);
    submenu.push(aboutMenuItem());
  }

  return {
    label: menuCopy["menu.help"],
    submenu,
  };
}
