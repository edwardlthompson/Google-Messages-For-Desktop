import { app, BrowserWindow } from "electron";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { IS_WINDOWS, RESOURCES_PATH } from "./constants";
import { buildComposeExpression } from "./compose";
import {
  isAssociationOnlyMode,
  isOnboardingSampleUrl,
} from "./onboardingMode";

export const PROTOCOL_SCHEMES = [
  "sms",
  "tel",
  "smsto",
  "callto",
  "im",
] as const;
const PROTOCOL_RE = /^(sms|tel|smsto|callto|im):/i;

export const APP_NAME = "Google Messages";
/** Value under HKCU\Software\RegisteredApplications (used by ms-settings deep link). */
export const APP_REG_NAME = "GoogleMessages";
export const PROG_IDS: Record<(typeof PROTOCOL_SCHEMES)[number], string> = {
  sms: "GoogleMessages.sms",
  tel: "GoogleMessages.tel",
  smsto: "GoogleMessages.smsto",
  callto: "GoogleMessages.callto",
  im: "GoogleMessages.im",
};

/** Instant Messaging client Capabilities (Win32 Clients\IM). */
const CAPS_REL = `Software\\Clients\\IM\\${APP_REG_NAME}\\Capabilities`;

export function normalizeNumber(raw: string): string {
  if (!raw) return "";
  let s = String(raw).trim();
  try {
    if (PROTOCOL_RE.test(s)) {
      const u = new URL(s.replace(PROTOCOL_RE, (_, p) => `${p.toLowerCase()}:`));
      s = u.pathname || u.hostname || "";
      if (s.startsWith("//")) s = s.slice(2);
      if (!s && u.href) {
        s = u.href.replace(PROTOCOL_RE, "").split("?")[0];
      }
    }
  } catch {
    s = s.replace(PROTOCOL_RE, "").split("?")[0];
  }
  s = decodeURIComponent(s).split("?")[0].split("&")[0];
  const hasPlus = s.trim().startsWith("+");
  const digits = s.replace(/[^\d]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Parse a protocol URL. Returns the phone number for compose, or "" for
 * open-only links (e.g. bare `im:` / `im:open` with no digits).
 */
export function parseProtocolUrl(
  url: string | undefined | null
): string | null {
  if (!url || typeof url !== "string") return null;
  if (!PROTOCOL_RE.test(url.trim())) return null;
  const number = normalizeNumber(url);
  // Bare IM open links (no phone) still launch/focus the app.
  if (!number && /^im:/i.test(url.trim())) return "";
  return number || null;
}

export function findProtocolArg(argv: string[]): string | null {
  for (const arg of argv) {
    if (PROTOCOL_RE.test(String(arg).trim())) return String(arg).trim();
  }
  return null;
}

function focusWindow(win: BrowserWindow | null): void {
  if (!win || win.isDestroyed()) return;
  if (!win.isVisible()) win.show();
  if (win.isMinimized()) win.restore();
  win.focus();
}

export async function handleProtocolUrl(
  win: BrowserWindow | null,
  url: string
): Promise<{ ok: boolean; number?: string; reason?: string; error?: string }> {
  // Stage A onboarding probes: Windows/mac/linux default-app chooser only.
  if (isAssociationOnlyMode() || isOnboardingSampleUrl(url)) {
    console.log("Skipping compose for onboarding association probe", url);
    return { ok: true, reason: "onboarding-association-only" };
  }

  const number = parseProtocolUrl(url);
  if (number === null) {
    return { ok: false, reason: "invalid" };
  }
  if (!win || win.isDestroyed()) {
    return { ok: false, number: number || undefined, reason: "no-window" };
  }

  focusWindow(win);

  // Open-only (e.g. im: with no phone number)
  if (!number) {
    try {
      const current = win.webContents.getURL();
      if (!/messages\.google\.com/i.test(current)) {
        await win.loadURL("https://messages.google.com/web/conversations");
      }
    } catch (err) {
      console.warn("Navigate on open-only protocol failed", err);
    }
    return { ok: true, reason: "opened" };
  }

  try {
    const current = win.webContents.getURL();
    if (!/messages\.google\.com/i.test(current)) {
      await win.loadURL("https://messages.google.com/web/conversations");
      await new Promise((r) => setTimeout(r, 1200));
    }
  } catch (err) {
    console.warn("Navigate before compose failed", err);
  }

  try {
    const result = await win.webContents.executeJavaScript(
      buildComposeExpression(number),
      true
    );
    console.log("Compose result", result);
    return { ok: !!(result && result.ok), number, ...result };
  } catch (err) {
    console.error("Compose executeJavaScript failed", err);
    return { ok: false, number, error: String(err) };
  }
}

/** Local HTML page with clickable sms/tel/im links for manual testing. */
export function protocolTestLinksPath(): string {
  return path.resolve(RESOURCES_PATH, "protocol-test-links.html");
}

/** Electron built-in protocol client registration (all platforms). */
export function registerElectronProtocolClients(): void {
  for (const scheme of PROTOCOL_SCHEMES) {
    try {
      if (process.defaultApp) {
        if (process.argv.length >= 2) {
          app.setAsDefaultProtocolClient(scheme, process.execPath, [
            path.resolve(process.argv[1]),
          ]);
        }
      } else {
        app.setAsDefaultProtocolClient(scheme);
      }
    } catch (err) {
      console.warn(`setAsDefaultProtocolClient(${scheme}) failed`, err);
    }
  }
}

function reg(args: string[]): { status: number | null; out: string } {
  const r = spawnSync("reg.exe", args, { encoding: "utf8", windowsHide: true });
  return { status: r.status, out: ((r.stdout || "") + (r.stderr || "")).trim() };
}

function regAdd(
  key: string,
  valueName: string | null,
  valueData: string,
  valueType = "REG_SZ"
): void {
  const args = ["add", key, "/f", "/t", valueType];
  if (valueName === "" || valueName == null) args.push("/ve");
  else args.push("/v", valueName);
  args.push("/d", valueData == null ? "" : String(valueData));
  const r = reg(args);
  if (r.status !== 0) {
    throw new Error(`reg add failed ${key} ${valueName}: ${r.out || r.status}`);
  }
}

function tryRegAdd(
  key: string,
  valueName: string | null,
  valueData: string,
  valueType = "REG_SZ"
): boolean {
  try {
    regAdd(key, valueName, valueData, valueType);
    return true;
  } catch {
    return false;
  }
}

function regAddNone(key: string, valueName: string): void {
  const r = reg(["add", key, "/f", "/t", "REG_NONE", "/v", valueName]);
  if (r.status !== 0) {
    tryRegAdd(key, valueName, "");
  }
}

function notifyShell(): void {
  spawnSync(
    "powershell.exe",
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-WindowStyle",
      "Hidden",
      "-Command",
      `Add-Type -Namespace Native -Name Shell32 -MemberDefinition '[DllImport("shell32.dll")] public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);';
       [Native.Shell32]::SHChangeNotify(0x8000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero)`,
    ],
    { windowsHide: true }
  );
}

function registerProgId(
  root: string,
  progId: string,
  label: string,
  cmd: string,
  icon: string
): void {
  const base = `${root}\\Software\\Classes\\${progId}`;
  regAdd(base, "", label);
  regAdd(base, "URL Protocol", "");
  regAdd(base, "FriendlyTypeName", label);
  regAdd(`${base}\\DefaultIcon`, "", icon);
  regAdd(`${base}\\shell\\open\\command`, "", cmd);
}

function registerSchemeClass(
  root: string,
  scheme: string,
  label: string,
  progId: string,
  cmd: string,
  icon: string
): void {
  const base = `${root}\\Software\\Classes\\${scheme}`;
  regAdd(base, "", label);
  regAdd(base, "URL Protocol", "");
  regAdd(`${base}\\DefaultIcon`, "", icon);
  regAdd(`${base}\\shell\\open\\command`, "", cmd);
  regAddNone(`${base}\\OpenWithProgids`, progId);
}

function setProtocolUserChoice(): boolean {
  if (/^(1|true|yes)$/i.test(String(process.env.GMFD_SKIP_SFTA || "").trim())) {
    console.log("Skipping UserChoice (GMFD_SKIP_SFTA)");
    return false;
  }
  const vendorSrc = path.join(RESOURCES_PATH, "vendor", "SFTA.ps1");
  let scriptBody: string;
  try {
    scriptBody = fs.readFileSync(vendorSrc, "utf8");
  } catch (err) {
    console.warn("SFTA.ps1 missing; cannot set UserChoice defaults", err);
    return false;
  }
  const outDir = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
    "GoogleMessages"
  );
  fs.mkdirSync(outDir, { recursive: true });
  const outScript = path.join(outDir, "SFTA.ps1");
  fs.writeFileSync(outScript, scriptBody, "utf8");
  const pairs = PROTOCOL_SCHEMES.map((proto) => [PROG_IDS[proto], proto]);
  const setCmds = pairs
    .map(
      ([prog, proto]) =>
        `Set-FTA -ProgId ${JSON.stringify(prog)} -Extension ${JSON.stringify(proto)}`
    )
    .join("; ");
  const ps = `. ${JSON.stringify(outScript)}; ${setCmds}; Write-Output 'SFTA_OK'`;
  const r = spawnSync(
    "powershell.exe",
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-WindowStyle",
      "Hidden",
      "-Command",
      ps,
    ],
    { encoding: "utf8", windowsHide: true, timeout: 60000 }
  );
  const out = ((r.stdout || "") + (r.stderr || "")).trim();
  if (r.status !== 0 || !/SFTA_OK/.test(out)) {
    console.warn("Set-FTA UserChoice failed", out || String(r.status));
    return false;
  }
  console.log("Set UserChoice defaults via SFTA");
  return true;
}

/**
 * Windows ProgId / Capabilities registration so Default Apps lists this app
 * for sms/tel (beyond Electron's setAsDefaultProtocolClient).
 */
export function registerWindowsProtocolHandlers(): void {
  if (!IS_WINDOWS) return;

  const exe = process.execPath;
  const exeName = path.basename(exe);
  const icon = `${exe},0`;
  // Keep quotes for paths with spaces; pass URL as %1
  const cmd = `"${exe}" "%1"`;
  const root = "HKCU";

  try {
    for (const scheme of PROTOCOL_SCHEMES) {
      const progId = PROG_IDS[scheme];
      const label =
        scheme === "im"
          ? `URL:Instant Message (${APP_NAME})`
          : scheme === "tel" || scheme === "callto"
            ? `URL:Telephone text (${APP_NAME})`
            : `URL:SMS Message (${APP_NAME})`;
      const schemeLabel =
        scheme === "im"
          ? "URL:Instant Message"
          : scheme === "tel" || scheme === "callto"
            ? "URL:Telephone"
            : "URL:SMS Message";
      registerProgId(root, progId, label, cmd, icon);
      registerSchemeClass(root, scheme, schemeLabel, progId, cmd, icon);
    }

    const appBase = `${root}\\Software\\Classes\\Applications\\${exeName}`;
    regAdd(appBase, "FriendlyAppName", APP_NAME);
    regAdd(`${appBase}\\DefaultIcon`, "", icon);
    regAdd(`${appBase}\\shell\\open\\command`, "", cmd);

    // Instant Messaging client type (Default Programs / Default apps)
    const imRoot = `${root}\\Software\\Clients\\IM\\${APP_REG_NAME}`;
    regAdd(imRoot, "", APP_NAME);
    regAdd(`${imRoot}\\DefaultIcon`, "", icon);
    regAdd(`${imRoot}\\shell\\open\\command`, "", `"${exe}"`);

    const caps = `${root}\\${CAPS_REL}`;
    regAdd(caps, "ApplicationName", APP_NAME);
    regAdd(
      caps,
      "ApplicationDescription",
      "Send SMS/RCS with Google Messages for web (dedicated desktop app)."
    );
    regAdd(caps, "ApplicationIcon", icon);
    for (const scheme of PROTOCOL_SCHEMES) {
      regAdd(`${caps}\\URLAssociations`, scheme, PROG_IDS[scheme]);
    }
    regAdd(`${root}\\Software\\RegisteredApplications`, APP_REG_NAME, CAPS_REL);

    // Drop legacy non-IM Clients path from earlier builds
    reg(["delete", `${root}\\Software\\Clients\\${APP_REG_NAME}`, "/f"]);

    // F-002: do not force UserChoice on every launch (conflicts with chooser onboarding).
    // Opt in: GMFD_FORCE_SFTA=1. Opt out remains GMFD_SKIP_SFTA=1.
    if (/^(1|true|yes)$/i.test(String(process.env.GMFD_FORCE_SFTA || "").trim())) {
      setProtocolUserChoice();
    } else {
      console.log(
        "Skipping auto UserChoice (SFTA); use OS Default apps / onboarding. Set GMFD_FORCE_SFTA=1 to force."
      );
    }
    notifyShell();
    console.log("Registered Windows protocol handlers for", APP_NAME, exe);
  } catch (err) {
    console.warn("Windows protocol registration failed", err);
  }
}
