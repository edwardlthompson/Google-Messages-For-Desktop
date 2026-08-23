import { MenuItemConstructorOptions } from "electron";
import { checkForProductUpdate } from "../../helpers/productUpdateUi";

export const checkForUpdatesMenuItem: MenuItemConstructorOptions = {
  label: "Check for Updates…",
  click: () => {
    void checkForProductUpdate(true);
  },
};
