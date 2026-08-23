import { MenuItemConstructorOptions, shell } from "electron";
import { IS_MAC, IS_WINDOWS } from "../helpers/constants";
import { VENMO_DONATE_URL } from "../helpers/donate";
import { protocolTestLinksPath } from "../helpers/protocols";
import { aboutMenuItem } from "./items/about";
import { checkForUpdatesMenuItem } from "./items/updates";
import { separator } from "./items/separator";

const submenu: MenuItemConstructorOptions[] = [
  {
    label: "Protocol Test Links…",
    click: async (): Promise<void> => {
      const fileUrl = `file:///${protocolTestLinksPath().replace(/\\/g, "/")}`;
      await shell.openExternal(fileUrl);
    },
  },
  {
    label: "Donate via Venmo",
    click: async (): Promise<void> => {
      await shell.openExternal(VENMO_DONATE_URL);
    },
  },
  {
    label: "Learn More",
    click: async (): Promise<void> =>
      await shell.openExternal(
        "https://github.com/edwardlthompson/Google-Messages-For-Desktop"
      ),
  },
  {
    label: "OrangeDrangon Upstream",
    click: async (): Promise<void> =>
      await shell.openExternal(
        "https://github.com/OrangeDrangon/android-messages-desktop/"
      ),
  },
];

if (IS_WINDOWS) {
  submenu.push(separator);
  submenu.push(checkForUpdatesMenuItem);
}

if (!IS_MAC) {
  submenu.push(separator);
  submenu.push(aboutMenuItem);
}

export const helpMenuTemplate: MenuItemConstructorOptions = {
  label: "&Help",
  submenu,
};
