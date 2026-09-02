import openAboutWindow from "about-window";
import { app, MenuItemConstructorOptions } from "electron";
import path from "path";
import {
  ABOUT_PRODUCT_NAME,
  aboutCopyrightHtml,
  aboutDescriptionHtml,
} from "../../helpers/aboutCopy";
import { RESOURCES_PATH } from "../../helpers/constants";
import { menuCopy } from "../../helpers/menuCopy";

export function aboutMenuItem(): MenuItemConstructorOptions {
  return {
    label: menuCopy["menu.about"],
    click: () => {
      openAboutWindow({
        icon_path: path.resolve(RESOURCES_PATH, "icons", "512x512.png"),
        copyright: aboutCopyrightHtml(),
        product_name: ABOUT_PRODUCT_NAME,
        description: aboutDescriptionHtml(app.getLocale()),
        open_devtools: false,
        use_inner_html: true,
        win_options: {
          height: 680,
          resizable: false,
          minimizable: false,
          maximizable: false,
          show: false,
        },
      });
    },
  };
}
