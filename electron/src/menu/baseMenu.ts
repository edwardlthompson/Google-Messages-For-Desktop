import { MenuItemConstructorOptions } from "electron";
import { IS_MAC } from "../helpers/constants";
import { appMenuTemplate } from "./appMenu";
import { editMenuTemplate } from "./editMenu";
import { fileMenuTemplate } from "./fileMenu";
import { settingsMenu } from "./settingsMenu";
import { viewMenuTemplate } from "./viewMenu";
import { windowMenuTemplate } from "./windowMenu";

export function baseMenuTemplate(): MenuItemConstructorOptions[] {
  const menus: MenuItemConstructorOptions[] = [
    editMenuTemplate(),
    viewMenuTemplate(),
    windowMenuTemplate(),
  ];
  if (IS_MAC) {
    menus.unshift(appMenuTemplate());
  } else {
    menus.unshift(fileMenuTemplate());
    menus.push(settingsMenu());
  }
  return menus;
}
