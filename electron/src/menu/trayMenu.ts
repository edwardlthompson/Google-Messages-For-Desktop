import { app, MenuItemConstructorOptions } from "electron";
import { IS_MAC } from "../helpers/constants";
import { getMainWindow } from "../helpers/getMainWindow";
import { menuCopy } from "../helpers/menuCopy";
import { settingsCopy } from "../helpers/settingsCopy";
import { separator } from "./items/separator";
import { profileMenuItems } from "../helpers/sessionProfileUi";

export function trayMenuTemplate(): MenuItemConstructorOptions[] {
  return [
    {
      label: menuCopy["menu.tray_toggle"],
      click: (): void => {
        const mainWindow = getMainWindow();
        if (mainWindow != null) {
          if (mainWindow.isVisible()) {
            if (IS_MAC) {
              app.hide();
            } else {
              mainWindow.hide();
            }
          } else {
            mainWindow.show();
          }
        }
      },
    },
    separator,
    {
      label: menuCopy["menu.mark_all_read"],
      click: (): void => {
        getMainWindow()?.webContents.send("mark-all-read");
      },
    },
    separator,
    {
      label: settingsCopy["settings.profile"],
      submenu: profileMenuItems(),
    },
    separator,
    {
      label: menuCopy["menu.quit_app"],
      click: (): void => {
        app.quit();
      },
    },
  ];
}
