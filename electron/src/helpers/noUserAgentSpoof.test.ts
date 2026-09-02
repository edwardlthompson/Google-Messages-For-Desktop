import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function collectTs(dir: string, acc: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) collectTs(full, acc);
    else if (name.endsWith(".ts") && !name.endsWith(".test.ts")) acc.push(full);
  }
  return acc;
}

describe("no userAgent spoof", () => {
  it("does not call setUserAgent or assign userAgent in main/preload", () => {
    const spoof = /setUserAgent|\.userAgent\s*=/;
    for (const file of collectTs(SRC)) {
      const text = fs.readFileSync(file, "utf8");
      assert.equal(spoof.test(text), false, file);
    }
  });
});
