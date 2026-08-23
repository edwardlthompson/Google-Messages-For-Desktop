import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HIGH_REFRESH_ATTR,
  HIGH_REFRESH_CLASS,
  applyHighRefreshMark,
  applyPreferredRefreshHz,
  isScrollSurface,
  overflowAllowsScroll,
} from "./highRefreshScroll.ts";

describe("overflowAllowsScroll", () => {
  it("accepts auto and scroll only", () => {
    assert.equal(overflowAllowsScroll("auto"), true);
    assert.equal(overflowAllowsScroll("scroll"), true);
    assert.equal(overflowAllowsScroll("visible"), false);
    assert.equal(overflowAllowsScroll("hidden"), false);
    assert.equal(overflowAllowsScroll(""), false);
    assert.equal(overflowAllowsScroll(null), false);
  });
});

describe("isScrollSurface", () => {
  it("marks overflow-x or overflow-y scrollers", () => {
    assert.equal(isScrollSurface({ overflowY: "auto" }), true);
    assert.equal(isScrollSurface({ overflowX: "scroll" }), true);
    assert.equal(isScrollSurface({ overflowX: "visible", overflowY: "hidden" }), false);
  });
});

describe("applyHighRefreshMark", () => {
  it("sets the high-refresh hint once", () => {
    const style = { willChange: "" };
    const attrs: Record<string, string> = {};
    const classes: string[] = [];
    const target = {
      getAttribute: (name: string) => attrs[name] ?? null,
      setAttribute: (name: string, value: string) => {
        attrs[name] = value;
      },
      classList: { add: (name: string) => classes.push(name) },
      style,
    };
    applyHighRefreshMark(target);
    applyHighRefreshMark(target);
    assert.equal(attrs[HIGH_REFRESH_ATTR], "1");
    assert.deepEqual(classes, [HIGH_REFRESH_CLASS]);
    assert.equal(style.willChange, "scroll-position");
  });

  it("appends scroll-position to an existing will-change list", () => {
    const style = { willChange: "transform" };
    applyHighRefreshMark({
      setAttribute: () => undefined,
      style,
    });
    assert.equal(style.willChange, "transform, scroll-position");
  });
});

describe("applyPreferredRefreshHz", () => {
  it("rejects empty roots and non-positive rates", () => {
    assert.equal(applyPreferredRefreshHz(null, 120), false);
    const props: Record<string, string> = {};
    const root = {
      style: { setProperty: (name: string, value: string) => {
        props[name] = value;
      } },
    };
    assert.equal(applyPreferredRefreshHz(root, 0), false);
    assert.equal(applyPreferredRefreshHz(root, Number.NaN), false);
    assert.equal(Object.keys(props).length, 0);
  });

  it("writes the rounded Hz custom property", () => {
    const props: Record<string, string> = {};
    const root = {
      style: { setProperty: (name: string, value: string) => {
        props[name] = value;
      } },
    };
    assert.equal(applyPreferredRefreshHz(root, 119.6), true);
    assert.equal(props["--gmfd-refresh-hz"], "120");
  });
});
