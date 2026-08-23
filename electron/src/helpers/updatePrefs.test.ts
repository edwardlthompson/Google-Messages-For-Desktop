import assert from "node:assert/strict";
import { describe, it } from "node:test";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import {
  UPDATE_PREFS_FILENAME,
  createFilePrefsStore,
  parseUpdatePrefs,
} from "./updatePrefs.ts";

describe("parseUpdatePrefs", () => {
  it("defaults missing or invalid values", () => {
    assert.deepEqual(parseUpdatePrefs(null), {
      lastCheckAt: null,
      lastSeenVersion: null,
      dismissedVersion: null,
    });
    assert.equal(parseUpdatePrefs({ lastCheckAt: "nope" }).lastCheckAt, null);
  });
});

describe("createFilePrefsStore", () => {
  it("writes device-local product-update.json, not settings.json", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gmfd-prefs-"));
    const prefs = createFilePrefsStore(dir);
    prefs.markVersionSeen("1.8.1");
    prefs.markUpdateChecked(123, "1.8.2");
    assert.equal(fs.existsSync(path.join(dir, UPDATE_PREFS_FILENAME)), true);
    assert.equal(fs.existsSync(path.join(dir, "settings.json")), false);
    assert.deepEqual(prefs.load(), {
      lastCheckAt: 123,
      lastSeenVersion: "1.8.1",
      dismissedVersion: "1.8.2",
    });
  });
});
