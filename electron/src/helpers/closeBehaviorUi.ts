import { BrowserWindow, dialog } from "electron";
import { parseCloseAction, resolveWindowClose } from "./closeBehavior";
import { IS_MAC } from "./constants";
import { settings } from "./settings";
import { menuCopy } from "./menuCopy";

export function handleMainWindowClose(
  win: BrowserWindow,
  quitViaContext: boolean
): "hide" | "quit" {
  const action = resolveWindowClose(
    settings.trayEnabled.value,
    parseCloseAction(settings.closeActionPreference.value),
    quitViaContext,
    IS_MAC
  );
  if (action === "quit") return "quit";
  if (action === "tray") return "hide";

  const result = dialog.showMessageBoxSync(win, {
    type: "question",
    buttons: [menuCopy["dialog.close_tray"], menuCopy["dialog.close_quit"]],
    defaultId: 0,
    cancelId: 0,
    title: menuCopy["dialog.close_title"],
    message: menuCopy["dialog.close_message"],
    checkboxLabel: menuCopy["dialog.close_remember"],
    checkboxChecked: false,
  });
  const hide = result.response === 0;
  if (result.checkboxChecked) {
    settings.closeActionPreference.next(hide ? "tray" : "quit");
  }
  return hide ? "hide" : "quit";
}
