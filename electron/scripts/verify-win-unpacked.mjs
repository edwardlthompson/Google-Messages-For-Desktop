#!/usr/bin/env node
/**
 * Fail the Windows package step if electron-builder left an incomplete
 * win-unpacked tree (missing ICU / pak / locales causes instant crash).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const unpacked = path.join(root, "dist", "win-unpacked");

const requiredFiles = [
  "GoogleMessages.exe",
  "icudtl.dat",
  "resources.pak",
  "chrome_100_percent.pak",
  "chrome_200_percent.pak",
  "v8_context_snapshot.bin",
  "snapshot_blob.bin",
  "resources",
  "locales",
];

if (!fs.existsSync(unpacked)) {
  console.error(`FAIL: missing ${unpacked}`);
  process.exit(1);
}

const missing = requiredFiles.filter(
  (name) => !fs.existsSync(path.join(unpacked, name))
);
if (missing.length) {
  console.error("FAIL: win-unpacked incomplete; missing:");
  for (const name of missing) console.error(`  - ${name}`);
  process.exit(1);
}

const localeCount = fs.readdirSync(path.join(unpacked, "locales")).length;
if (localeCount < 1) {
  console.error("FAIL: win-unpacked/locales is empty");
  process.exit(1);
}

const asar = path.join(unpacked, "resources", "app.asar");
if (!fs.existsSync(asar)) {
  console.error(`FAIL: missing ${asar}`);
  process.exit(1);
}

console.log(
  `OK   win-unpacked runtime complete (${localeCount} locales, app.asar present)`
);
