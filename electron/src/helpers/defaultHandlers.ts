import { spawnSync } from "child_process";
import { PROTOCOL_SCHEMES, PROG_IDS } from "./protocols";

export type DefaultHandlerStatus = Record<
  (typeof PROTOCOL_SCHEMES)[number],
  boolean
>;

function readUserChoiceProgId(scheme: string): string | null {
  const key = `HKCU\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\${scheme}\\UserChoice`;
  const r = spawnSync(
    "reg.exe",
    ["query", key, "/v", "ProgId"],
    { encoding: "utf8", windowsHide: true }
  );
  if (r.status !== 0) return null;
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  const m = out.match(/ProgId\s+REG_SZ\s+(\S+)/i);
  return m ? m[1].trim() : null;
}

/** True when Windows UserChoice ProgId matches our GoogleMessages.* handler. */
export function getDefaultHandlerStatus(): DefaultHandlerStatus {
  const status = {} as DefaultHandlerStatus;
  for (const scheme of PROTOCOL_SCHEMES) {
    const progId = readUserChoiceProgId(scheme);
    status[scheme] = !!progId && progId.toLowerCase() === PROG_IDS[scheme].toLowerCase();
  }
  return status;
}

export function allDefaultsSet(status: DefaultHandlerStatus): boolean {
  return PROTOCOL_SCHEMES.every((s) => status[s]);
}
