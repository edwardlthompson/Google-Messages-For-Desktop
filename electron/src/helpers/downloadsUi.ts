import path from "path";
import { app, BrowserWindow, dialog, Session, shell } from "electron";
import { getMainWindow } from "./getMainWindow";
import { isExpectedDownloadMime } from "./downloadMime";
import { safeDownloadName } from "./downloadName";
import { menuCopy } from "./menuCopy";
import { downloadProgressLabel, shouldOpenDownloadedMedia } from "./downloadProgress";
import { settings } from "./settings";

export function downloadsDir(): string {
  const custom = settings.customDownloadsPath.value?.trim();
  return custom || app.getPath("downloads");
}

export async function chooseDownloadsFolder(win: BrowserWindow): Promise<void> {
  const picked = await dialog.showOpenDialog(win, {
    title: menuCopy["dialog.download_location"],
    properties: ["openDirectory", "createDirectory"],
  });
  const dir = picked.filePaths[0];
  if (picked.canceled || !dir) return;
  settings.customDownloadsPath.next(dir);
}

export function openDownloadsFolder(): void {
  void shell.openPath(downloadsDir());
}

export function bindDownloadLocation(sess: Session): void {
  sess.on("will-download", (_event, item) => {
    const mime = item.getMimeType();
    if (!isExpectedDownloadMime(mime)) {
      const win = getMainWindow();
      const choice = win
        ? dialog.showMessageBoxSync(win, {
            type: "warning",
            buttons: ["Cancel", "Save"],
            defaultId: 0,
            cancelId: 0,
            title: menuCopy["dialog.close_title"],
            message: `Save ${item.getFilename() || "this file"}?`,
            detail: mime ? `Type: ${mime}` : "This is not a common media or document type.",
          })
        : 0;
      if (choice !== 1) {
        item.cancel();
        return;
      }
    }
    const dir = settings.customDownloadsPath.value?.trim();
    if (dir) {
      const name = safeDownloadName(item.getFilename());
      item.setSavePath(path.join(dir, name));
    }
    item.on("updated", (_ev, state) => {
      if (state !== "progressing") return;
      const win = getMainWindow();
      if (!win || win.isDestroyed()) return;
      const total = item.getTotalBytes();
      const received = item.getReceivedBytes();
      win.setTitle(downloadProgressLabel(received, total));
      if (total > 0) win.setProgressBar(Math.min(1, received / total));
    });
    item.once("done", (_ev, state) => {
      const win = getMainWindow();
      if (win && !win.isDestroyed()) {
        win.setTitle("Google Messages");
        win.setProgressBar(-1);
      }
      if (state !== "completed") return;
      const dest = item.getSavePath();
      if (dest && shouldOpenDownloadedMedia(item.getMimeType())) {
        void shell.openPath(dest);
      }
    });
  });
}
