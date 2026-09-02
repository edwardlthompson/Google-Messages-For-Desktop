import { app, MenuItemConstructorOptions } from "electron";
import { getMainWindow } from "../helpers/getMainWindow";
import { menuCopy } from "../helpers/menuCopy";
import { checkForUpdatesMenuItem } from "./items/updates";
import { separator } from "./items/separator";

export function fileMenuTemplate(): MenuItemConstructorOptions {
  return {
    label: menuCopy["menu.file"],
    submenu: [
      checkForUpdatesMenuItem(),
      {
        label: menuCopy["menu.print"],
        accelerator: "CmdOrCtrl+P",
        click: (): void => {
          getMainWindow()?.webContents.print();
        },
      },
      separator,
      {
        label: menuCopy["menu.quit_app"],
        click: (): void => app.quit(),
      },
    ],
  };
}
