import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isLocalTrayPng } from "./customTrayIcon.ts";

describe("isLocalTrayPng", () => {
  it("allows a local png and rejects URLs", () => {
    assert.equal(isLocalTrayPng("tray-icon.png"), true);
    assert.equal(isLocalTrayPng("https://evil.example/x.png"), false);
    assert.equal(isLocalTrayPng("icon.jpg"), false);
    assert.equal(isLocalTrayPng(""), false);
  });
});
