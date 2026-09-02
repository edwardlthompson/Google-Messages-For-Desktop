import { BrowserWindow, MenuItemConstructorOptions } from "electron";
import { openFindInPage } from "../helpers/findInPageUi";
import { menuCopy } from "../helpers/menuCopy";

export function editMenuTemplate(): MenuItemConstructorOptions {
  return {
    label: menuCopy["menu.edit"],
    submenu: [
      { label: menuCopy["menu.undo"], accelerator: "CmdOrCtrl+Z", role: "undo" },
      { label: menuCopy["menu.redo"], accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
      { type: "separator" },
      { label: menuCopy["menu.cut"], accelerator: "CmdOrCtrl+X", role: "cut" },
      { label: menuCopy["menu.copy"], accelerator: "CmdOrCtrl+C", role: "copy" },
      { label: menuCopy["menu.paste"], accelerator: "CmdOrCtrl+V", role: "paste" },
      {
        label: menuCopy["menu.select_all"],
        accelerator: "CmdOrCtrl+A",
        role: "selectAll",
      },
      { type: "separator" },
      {
        label: menuCopy["menu.find"],
        accelerator: "CmdOrCtrl+F",
        click: (): void => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) openFindInPage(win);
        },
      },
      {
        label: menuCopy["menu.focus_list"],
        accelerator: "CmdOrCtrl+Shift+L",
        click: (): void => {
          BrowserWindow.getFocusedWindow()?.webContents.send(
            "focus-conversation-list"
          );
        },
      },
    ],
  };
}
