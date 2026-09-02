import { app, MenuItemConstructorOptions, shell } from "electron";
import { VENMO_DONATE_URL } from "../helpers/donate";
import { menuCopy } from "../helpers/menuCopy";
import { ABOUT_PRODUCT_NAME } from "../helpers/aboutCopy";
import { aboutMenuItem } from "./items/about";
import { reportBugMenuItem, requestFeatureMenuItem } from "./items/feedback";
import { separator } from "./items/separator";
import { checkForUpdatesMenuItem } from "./items/updates";
import { settingsMenu } from "./settingsMenu";

export function appMenuTemplate(): MenuItemConstructorOptions {
  return {
    label: ABOUT_PRODUCT_NAME.replace(" For Desktop", ""),
    submenu: [
      aboutMenuItem(),
      reportBugMenuItem(),
      requestFeatureMenuItem(),
      {
        label: menuCopy["menu.donate"],
        click: async (): Promise<void> => {
          await shell.openExternal(VENMO_DONATE_URL);
        },
      },
      checkForUpdatesMenuItem(),
      separator,
      {
        role: "close",
      },
      settingsMenu(),
      separator,
      {
        label: menuCopy["menu.hide_app"],
        accelerator: "Command+H",
        click: (): void => app.hide(),
      },
      separator,
      {
        label: menuCopy["menu.quit"],
        accelerator: "Command+Q",
        click: (): void => app.quit(),
      },
    ],
  };
}
