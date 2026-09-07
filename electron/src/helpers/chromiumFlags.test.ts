import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { CHROMIUM_DISABLE_FEATURES } from "./chromiumFlags.ts";

describe("CHROMIUM_DISABLE_FEATURES", () => {
  it("disables device-bound sessions so pairing cookies can persist", () => {
    assert.match(CHROMIUM_DISABLE_FEATURES, /DeviceBoundSessions/);
    assert.match(CHROMIUM_DISABLE_FEATURES, /DeviceBoundSessionCredentials/);
  });

  it("is mirrored on the Windows Chrome --app host and browser-auth helper", () => {
    const root = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../.."
    );
    const host = fs.readFileSync(
      path.join(root, "host/windows/src/browser.js"),
      "utf8"
    );
    const auth = fs.readFileSync(
      path.join(root, "scripts/windows/gmfd-browser-auth.js"),
      "utf8"
    );
    for (const name of CHROMIUM_DISABLE_FEATURES.split(",")) {
      assert.match(host, new RegExp(name));
      assert.match(auth, new RegExp(name));
    }
  });
});
