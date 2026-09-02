import { MenuItemConstructorOptions } from "electron";
import { menuCopy } from "../helpers/menuCopy";

export function windowMenuTemplate(): MenuItemConstructorOptions {
  return {
    label: menuCopy["menu.window"],
    role: "windowMenu",
  };
}
