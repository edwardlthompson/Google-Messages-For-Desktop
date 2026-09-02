import { BrowserWindow, dialog } from "electron";
import { isDisplayCapturePermission, isMediaPermission, looksLikeCallsUi } from "./mediaPermission";
import { menuCopy } from "./menuCopy";

let grantedThisSession = false;

export function resetMediaGrantForTests(): void {
  grantedThisSession = false;
}

export async function confirmCallsMedia(
  win: BrowserWindow | null,
  permission: string,
  requestingUrl: string
): Promise<boolean> {
  if (!isMediaPermission(permission)) return true;
  if (!looksLikeCallsUi(requestingUrl)) return false;
  if (grantedThisSession) return true;
  if (!win || win.isDestroyed()) return false;
  const result = await dialog.showMessageBox(win, {
    type: "question",
    buttons: [menuCopy["dialog.block"], menuCopy["dialog.allow"]],
    defaultId: 1,
    cancelId: 0,
    title: menuCopy["dialog.close_title"],
    message: menuCopy["dialog.calls_media"],
    detail: menuCopy["dialog.calls_detail"],
  });
  grantedThisSession = result.response === 1;
  return grantedThisSession;
}

export async function confirmCallsScreenShare(
  win: BrowserWindow | null,
  permission: string,
  requestingUrl: string
): Promise<boolean> {
  if (!isDisplayCapturePermission(permission)) return false;
  if (!looksLikeCallsUi(requestingUrl)) return false;
  if (!win || win.isDestroyed()) return false;
  const result = await dialog.showMessageBox(win, {
    type: "question",
    buttons: [menuCopy["dialog.block"], menuCopy["dialog.allow"]],
    defaultId: 0,
    cancelId: 0,
    title: menuCopy["dialog.close_title"],
    message: menuCopy["dialog.calls_share"],
    detail: menuCopy["dialog.calls_detail"],
  });
  return result.response === 1;
}
