import { app, MenuItemConstructorOptions } from "electron";
import { getMainWindow } from "../helpers/getMainWindow";
import { menuCopy } from "../helpers/menuCopy";

export function devMenuTemplate(): MenuItemConstructorOptions {
  return {
    label: menuCopy["menu.dev"],
    submenu: [
      {
        label: menuCopy["menu.reload"],
        accelerator: "CmdOrCtrl+R",
        click: (): void => getMainWindow()?.webContents.reloadIgnoringCache(),
      },
      {
        label: menuCopy["menu.dev_tools"],
        accelerator: "CmdOrCtrl+Shift+I",
        click: (): void => getMainWindow()?.webContents.toggleDevTools(),
      },
      {
        label: "Simulate renderer crash",
        click: (): void => {
          getMainWindow()?.webContents.forcefullyCrashRenderer();
        },
      },
      {
        label: menuCopy["menu.quit"],
        accelerator: "CmdOrCtrl+Q",
        click: (): void => app.quit(),
      },
    ],
  };
}
