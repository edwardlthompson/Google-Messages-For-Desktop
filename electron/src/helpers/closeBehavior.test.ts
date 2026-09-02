import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCloseAction, resolveWindowClose } from "./closeBehavior.ts";

describe("resolveWindowClose", () => {
  it("quits from the Quit command or when tray is off", () => {
    assert.equal(resolveWindowClose(true, "ask", true), "quit");
    assert.equal(resolveWindowClose(false, "tray", false), "quit");
  });

  it("hides on macOS close box without asking", () => {
    assert.equal(resolveWindowClose(false, "ask", false, true), "tray");
    assert.equal(resolveWindowClose(true, "quit", true, true), "quit");
  });

  it("honors remembered tray/quit and otherwise asks", () => {
    assert.equal(resolveWindowClose(true, "tray", false), "tray");
    assert.equal(resolveWindowClose(true, "quit", false), "quit");
    assert.equal(resolveWindowClose(true, "ask", false), "ask");
  });
});

describe("parseCloseAction", () => {
  it("defaults unknown values to ask", () => {
    assert.equal(parseCloseAction("tray"), "tray");
    assert.equal(parseCloseAction("nope"), "ask");
    assert.equal(parseCloseAction(null), "ask");
  });
});
