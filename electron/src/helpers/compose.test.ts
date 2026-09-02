import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildComposeExpression } from "./compose.ts";

describe("buildComposeExpression", () => {
  it("embeds number and optional body as JSON", () => {
    const expr = buildComposeExpression("+15551212", "Hello there");
    assert.match(expr, /\+15551212/);
    assert.match(expr, /Hello there/);
    assert.match(expr, /fillBody/);
  });

  it("omits a usable body when none is provided", () => {
    const expr = buildComposeExpression("+15551212");
    assert.match(expr, /const body = ""/);
  });
});
