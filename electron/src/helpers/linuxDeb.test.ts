import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const configPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../electron-builder.config.js"
);

describe("linux .deb package config", () => {
  it("ships only the Debian installer and marks a single main window", () => {
    const src = readFileSync(configPath, "utf8");
    assert.match(src, /linux:\s*\{/);
    assert.match(src, /target:\s*\[\s*"deb"\s*\]/);
    assert.equal(/target:\s*\[[^\]]*AppImage/i.test(src), false);
    assert.match(src, /SingleMainWindow:\s*"true"/);
  });
});
