import { clipboard, ipcMain, BrowserWindow, shell } from "electron";
import path from "path";
import {
  feedbackMarkdown,
  isAllowedGithubOpen,
  issueTitle,
} from "./feedbackPreview";
import { feedbackCopy, type FeedbackKind } from "./feedbackCopy";
import { feedbackPanelHtml } from "./feedbackPanelHtml";
import {
  RELEASE_REPO,
  composeGithubIssueUrl,
  searchDuplicateIssues,
} from "./githubFeedback";

let hooked = false;
let win: BrowserWindow | null = null;
let lastSearchAt = 0;

function preloadPath(): string {
  return path.resolve(__dirname, "feedback-bridge.js");
}

function ensureIpc(): void {
  if (hooked) return;
  hooked = true;
  ipcMain.handle("feedback:copy", (_e, kindRaw: unknown, text: unknown) => {
    const kind: FeedbackKind = kindRaw === "feature" ? "feature" : "bug";
    const desc = typeof text === "string" ? text : "";
    clipboard.writeText(feedbackMarkdown(kind, desc, ""));
  });
  ipcMain.handle(
    "feedback:open",
    async (_e, kindRaw: unknown, description: unknown) => {
      const kind: FeedbackKind = kindRaw === "feature" ? "feature" : "bug";
      const desc = typeof description === "string" ? description : "";
      const md = feedbackMarkdown(kind, desc, "");
      const now = Date.now();
      const searched = await searchDuplicateIssues(
        fetch,
        RELEASE_REPO,
        desc.slice(0, 80),
        lastSearchAt,
        now
      );
      lastSearchAt = searched.searchedAt;
      const composed = composeGithubIssueUrl(RELEASE_REPO, issueTitle(kind), md);
      if (composed.copiedBody) clipboard.writeText(md);
      if (!isAllowedGithubOpen(composed.url, `https://github.com/${RELEASE_REPO}`)) {
        return;
      }
      await shell.openExternal(composed.url);
    }
  );
  ipcMain.handle("feedback:discard", () => {
    try {
      clipboard.writeText("");
    } catch {
      /* best-effort */
    }
    win?.close();
  });
}

export function openFeedbackWindow(kind: FeedbackKind): void {
  ensureIpc();
  if (win && !win.isDestroyed()) {
    win.close();
    win = null;
  }
  win = new BrowserWindow({
    width: 520,
    height: 560,
    title:
      kind === "bug"
        ? feedbackCopy["feedback.bug"]
        : feedbackCopy["feedback.feature"],
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  void win.loadURL(
    "data:text/html;charset=utf-8," + encodeURIComponent(feedbackPanelHtml(kind))
  );
  win.on("closed", () => {
    win = null;
  });
}
