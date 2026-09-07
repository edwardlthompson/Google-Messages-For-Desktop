#!/usr/bin/env node
/**
 * Fail the Linux package step if electron-builder left an incomplete
 * linux-unpacked tree (missing ICU / pak / locales causes instant crash).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const unpacked = path.join(root, "dist", "linux-unpacked");

const requiredFiles = [
  "GoogleMessages",
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
  console.error("FAIL: linux-unpacked incomplete; missing:");
  for (const name of missing) console.error(`  - ${name}`);
  process.exit(1);
}

const localeCount = fs.readdirSync(path.join(unpacked, "locales")).length;
if (localeCount < 1) {
  console.error("FAIL: linux-unpacked/locales is empty");
  process.exit(1);
}

const asar = path.join(unpacked, "resources", "app.asar");
if (!fs.existsSync(asar)) {
  console.error(`FAIL: missing ${asar}`);
  process.exit(1);
}

const bin = path.join(unpacked, "GoogleMessages");
try {
  fs.accessSync(bin, fs.constants.X_OK);
} catch {
  console.error(`FAIL: ${bin} is not executable`);
  process.exit(1);
}

console.log(
  `OK   linux-unpacked runtime complete (${localeCount} locales, app.asar present)`
);
