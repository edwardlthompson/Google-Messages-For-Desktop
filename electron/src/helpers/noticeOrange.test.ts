import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

describe("OrangeDrangon NOTICE", () => {
  it("is referenced from About copy and README", () => {
    const notice = path.join(ROOT, "electron", "NOTICE-ORANGEDRANGON.txt");
    assert.equal(fs.existsSync(notice), true);
    const about = fs.readFileSync(
      path.join(ROOT, "electron", "src", "helpers", "aboutCopy.ts"),
      "utf8"
    );
    const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
    assert.match(about, /NOTICE-ORANGEDRANGON/);
    assert.match(readme, /NOTICE-ORANGEDRANGON/);
  });
});
