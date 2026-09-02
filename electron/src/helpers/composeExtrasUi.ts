import { BrowserWindow, clipboard, dialog } from "electron";
import { buildComposeExpression } from "./compose";
import {
  applyProtocolSignature,
  parseSignature,
  parseSnippet,
  shouldConfirmProtocolCompose,
} from "./composeExtras";
import { menuCopy } from "./menuCopy";
import { parseProtocolBody } from "./protocolParse";
import { parseMutedToastTitles } from "./liveRegion";
import { rememberProtocolNumber } from "./jumpList";
import { settings } from "./settings";

export function copySnippet(slot: 1 | 2 | 3): void {
  const key = slot === 1 ? "cannedSnippet1" : slot === 2 ? "cannedSnippet2" : "cannedSnippet3";
  const text = parseSnippet(settings[key].value);
  if (text) clipboard.writeText(text);
}

export function saveClipboardAsSnippet(slot: 1 | 2 | 3): void {
  const key = slot === 1 ? "cannedSnippet1" : slot === 2 ? "cannedSnippet2" : "cannedSnippet3";
  settings[key].next(parseSnippet(clipboard.readText()));
}

export function saveClipboardAsMutedToast(): void {
  const name = parseMutedToastTitles([clipboard.readText()])[0];
  if (!name) return;
  settings.mutedToastTitles.next(
    parseMutedToastTitles([name, ...settings.mutedToastTitles.value])
  );
}

export function saveClipboardAsSignature(): void {
  settings.protocolSignature.next(parseSignature(clipboard.readText()));
}

export async function executeProtocolCompose(
  win: BrowserWindow,
  url: string,
  number: string
): Promise<{ ok: boolean; number: string; reason?: string; error?: string }> {
  const body = applyProtocolSignature(
    parseProtocolBody(url),
    settings.protocolSignature.value
  );
  if (shouldConfirmProtocolCompose(settings.confirmProtocolCompose.value, number)) {
    const choice = await dialog.showMessageBox(win, {
      type: "question",
      buttons: [menuCopy["dialog.cancel"], menuCopy["dialog.allow"]],
      defaultId: 0,
      cancelId: 0,
      title: menuCopy["dialog.close_title"],
      message: `Start a chat with ${number}?`,
      detail: body ? body.slice(0, 400) : "No message body.",
    });
    if (choice.response !== 1) {
      return { ok: false, number, reason: "cancelled" };
    }
  }
  try {
    const result = await win.webContents.executeJavaScript(
      buildComposeExpression(number, body),
      true
    );
    const ok = !!(result && result.ok);
    if (ok) {
      settings.lastProtocolNumbers.next(
        rememberProtocolNumber(settings.lastProtocolNumbers.value, number)
      );
    }
    return { ok, number, ...result };
  } catch (err) {
    console.error("Compose executeJavaScript failed", err);
    return { ok: false, number, error: String(err) };
  }
}
