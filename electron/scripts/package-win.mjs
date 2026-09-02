#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function ebusyHint(stderr) {
  if (!/EBUSY|resource busy or locked|unable to access/i.test(String(stderr))) {
    return null;
  }
  return "Close Google Messages (including electron/dist/win-unpacked/GoogleMessages.exe) and retry package:win.";
}

const builder = spawnSync(
  "npx",
  ["electron-builder", "--config", "electron-builder.config.js", "--win", "--publish", "never"],
  { cwd: root, encoding: "utf8", shell: true }
);
const combined = `${builder.stdout ?? ""}\n${builder.stderr ?? ""}`;
if (builder.status !== 0) {
  const hint = ebusyHint(combined);
  if (hint) console.error(hint);
  if (combined.trim()) console.error(combined);
  process.exit(builder.status ?? 1);
}
const verify = spawnSync(process.execPath, ["scripts/verify-win-unpacked.mjs"], {
  cwd: root,
  encoding: "utf8",
  stdio: "inherit",
});
process.exit(verify.status ?? 1);
