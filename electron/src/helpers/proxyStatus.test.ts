import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { proxyStatusLine } from "./proxyStatus.ts";

describe("proxyStatusLine", () => {
  it("prefers HTTPS_PROXY then falls back to system", () => {
    assert.match(proxyStatusLine({ HTTPS_PROXY: "http://proxy.example:8080" }), /proxy\.example/);
    assert.match(proxyStatusLine({}), /system/);
  });
});
