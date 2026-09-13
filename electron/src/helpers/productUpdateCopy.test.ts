import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  updateAvailableDetail,
  updateCurrentDetail,
  updateFailedDetail,
} from "./productUpdateCopy.ts";

describe("productUpdateCopy", () => {
  it("names the download file and install steps when an installer matches", () => {
    const detail = updateAvailableDetail(
      "1.8.1",
      "1.9.0",
      "Google.Messages-v1.9.0-win-x64.exe"
    );
    assert.match(detail, /1\.8\.1/);
    assert.match(detail, /1\.9\.0/);
    assert.match(detail, /Google\.Messages-v1\.9\.0-win-x64\.exe/);
    assert.match(detail, /browser/);
    assert.match(detail, /restart/i);
    assert.equal(/sudo apt install/i.test(detail), false);
  });

  it("tells Linux users to install the .deb", () => {
    const detail = updateAvailableDetail(
      "1.8.1",
      "1.9.0",
      "Google.Messages-v1.9.0-linux-amd64.deb"
    );
    assert.match(detail, /\.deb/);
    assert.match(detail, /sudo apt install/);
  });

  it("explains a tag-only fallback and a failed check", () => {
    assert.match(updateAvailableDetail("1.8.1", "1.9.0", null), /release page/);
    assert.match(updateCurrentDetail("1.9.0", "1.9.0"), /No newer installer/);
    assert.match(updateFailedDetail(), /GitHub Releases/);
  });
});
