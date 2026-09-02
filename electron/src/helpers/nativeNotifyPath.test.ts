import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const helpers = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

describe("native OS notification path", () => {
  it("uses Electron Notification and does not spawn a BrowserWindow toast", () => {
    const text = fs.readFileSync(
      path.join(helpers, "osNotification.ts"),
      "utf8"
    );
    assert.match(text, /new Notification\(/);
    assert.equal(/new BrowserWindow\(/.test(text), false);
  });
});
