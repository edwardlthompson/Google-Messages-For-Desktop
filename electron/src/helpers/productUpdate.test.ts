import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MS_DAY,
  isNewerVersion,
  parseAssetVersion,
  productKindForPlatform,
  selectProductAsset,
  shouldCheckDaily,
  shouldNudgeDonate,
  shouldPromptUpdate,
} from "./productUpdate.ts";

describe("shouldCheckDaily", () => {
  it("waits a full day", () => {
    assert.equal(shouldCheckDaily(null, 0), true);
    assert.equal(shouldCheckDaily(0, MS_DAY - 1), false);
    assert.equal(shouldCheckDaily(0, MS_DAY), true);
  });
});

describe("parseAssetVersion", () => {
  it("reads product installer filenames, not git or template tags", () => {
    assert.equal(
      parseAssetVersion("Google.Messages-v1.8.1-win-x64.exe", "exe"),
      "1.8.1"
    );
    assert.equal(
      parseAssetVersion("Google-Messages-1.8.2-x64-setup.exe", "exe"),
      "1.8.2"
    );
    assert.equal(
      parseAssetVersion("google-messages-1.10.8-foss.apk", "apk"),
      "1.10.8"
    );
    assert.equal(
      parseAssetVersion("Google.Messages-v1.8.2-mac-universal.dmg", "dmg"),
      "1.8.2"
    );
    assert.equal(
      parseAssetVersion(
        "Google.Messages-v1.8.2-linux-x86_64.AppImage",
        "appimage"
      ),
      "1.8.2"
    );
    assert.equal(parseAssetVersion("v1.8.1", "exe"), null);
    assert.equal(parseAssetVersion("v0.22.1", "exe"), null);
    assert.equal(
      parseAssetVersion("Google.Messages-v1.8.1-win-x64.portable.exe", "exe"),
      null
    );
  });
});

describe("selectProductAsset", () => {
  it("selects the matching installer URL", () => {
    const picked = selectProductAsset(
      [
        { name: "sbom.cyclonedx.json", url: "https://example.com/sbom" },
        {
          name: "Google.Messages-v1.8.2-win-x64.exe",
          url: "https://example.com/setup.exe",
        },
      ],
      "exe"
    );
    assert.deepEqual(picked, {
      version: "1.8.2",
      url: "https://example.com/setup.exe",
    });
  });
});

describe("shouldNudgeDonate", () => {
  it("nudges only after a version change", () => {
    assert.equal(shouldNudgeDonate(null, "1.8.1"), false);
    assert.equal(shouldNudgeDonate("1.8.1", "1.8.1"), false);
    assert.equal(shouldNudgeDonate("1.8.1", "1.8.2"), true);
  });
});

describe("shouldPromptUpdate", () => {
  it("skips dismissed or equal versions", () => {
    assert.equal(isNewerVersion("1.8.1", "1.8.2"), true);
    assert.equal(shouldPromptUpdate("1.8.1", "1.8.2", null), true);
    assert.equal(shouldPromptUpdate("1.8.1", "1.8.2", "1.8.2"), false);
    assert.equal(shouldPromptUpdate("1.8.2", "1.8.2", null), false);
    assert.equal(shouldPromptUpdate("1.8.1", null, null), false);
  });
});

describe("productKindForPlatform", () => {
  it("matches this OS installer kind", () => {
    assert.equal(productKindForPlatform("win32"), "exe");
    assert.equal(productKindForPlatform("darwin"), "dmg");
    assert.equal(productKindForPlatform("linux"), "appimage");
  });
});
