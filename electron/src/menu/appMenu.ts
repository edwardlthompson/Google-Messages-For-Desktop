import { app, MenuItemConstructorOptions, shell } from "electron";
import { VENMO_DONATE_URL } from "../helpers/donate";
import { aboutMenuItem } from "./items/about";
import { separator } from "./items/separator";
import { checkForUpdatesMenuItem } from "./items/updates";
import { settingsMenu } from "./settingsMenu";

// This is the "Application" menu, which is only used on macOS
export const appMenuTemplate: MenuItemConstructorOptions = {
  label: "Google Messages",
  submenu: [
    aboutMenuItem,
    {
      label: "Donate via Venmo",
      click: async (): Promise<void> => {
        await shell.openExternal(VENMO_DONATE_URL);
      },
    },
    checkForUpdatesMenuItem,
    separator,
    {
      role: "close",
    },
    settingsMenu,
    separator,
    {
      label: "Hide Google Messages",
      accelerator: "Command+H",
      click: (): void => app.hide(),
    },
    separator,
    {
      label: "Quit",
      accelerator: "Command+Q",
      click: (): void => app.quit(),
    },
  ],
};
