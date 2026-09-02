import { MenuItemConstructorOptions } from "electron";
import { menuCopy } from "../helpers/menuCopy";

export function viewMenuTemplate(): MenuItemConstructorOptions {
  return {
    label: menuCopy["menu.view"],
    submenu: [
      {
        role: "togglefullscreen",
      },
      {
        role: "reload",
      },
      {
        type: "separator",
      },
      {
        role: "resetZoom",
      },
      {
        role: "zoomIn",
      },
      {
        role: "zoomIn",
        accelerator: "CommandOrControl+=",
        visible: false,
        enabled: true,
      },
      {
        role: "zoomOut",
      },
    ],
  };
}
