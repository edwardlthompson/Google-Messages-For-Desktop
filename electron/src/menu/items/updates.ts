import { MenuItemConstructorOptions } from "electron";
import { menuCopy } from "../../helpers/menuCopy";
import { checkForProductUpdate } from "../../helpers/productUpdateUi";
import { policyDisablesUpdates } from "../../helpers/managedPolicy";
import { getManagedPolicy } from "../../helpers/managedPolicyUi";

export function checkForUpdatesMenuItem(): MenuItemConstructorOptions {
  return {
    label: menuCopy["menu.updates"],
    enabled: !policyDisablesUpdates(getManagedPolicy()),
    click: () => {
      void checkForProductUpdate(true);
    },
  };
}
