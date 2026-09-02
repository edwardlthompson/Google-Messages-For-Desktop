import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ABOUT_REPO_URL } from "./aboutCopy.ts";
import {
  canOpenGithub,
  composeGithubOpen,
  escapeForPreview,
  feedbackMarkdown,
  githubDisabledReason,
  isAllowedGithubOpen,
} from "./feedbackPreview.ts";
import { feedbackPanelHtml } from "./feedbackPanelHtml.ts";

describe("escapeForPreview", () => {
  it("never leaves raw tags for innerHTML-unsafe input", () => {
    const raw = '<img src=x onerror=alert(1)><script>steal()</script>';
    const out = escapeForPreview(raw);
    assert.equal(out.includes("<"), false);
    assert.match(out, /&lt;img/);
    assert.match(out, /&lt;script/);
  });
});

describe("feedbackMarkdown / github gates", () => {
  it("requires description or stack to open GitHub", () => {
    assert.equal(canOpenGithub("  ", ""), false);
    assert.equal(canOpenGithub("broke", ""), true);
    assert.match(githubDisabledReason(true, "", "") ?? "", /description/i);
    assert.match(githubDisabledReason(false, "x", "") ?? "", /offline/i);
    assert.equal(githubDisabledReason(true, "x", ""), null);
  });

  it("builds markdown without HTML", () => {
    const md = feedbackMarkdown("bug", "window died", "Error: x");
    assert.match(md, /## Kind/);
    assert.match(md, /bug/);
    assert.match(md, /window died/);
    assert.equal(md.includes("<"), false);
  });
});

describe("feedbackPanelHtml", () => {
  it("updates preview with textContent never innerHTML", () => {
    const html = feedbackPanelHtml("bug");
    assert.match(html, /preview\.textContent/);
    assert.equal(html.includes("innerHTML"), false);
    assert.match(html, /role="region"/);
  });
});

describe("composeGithubOpen", () => {
  it("only allows https GitHub issue URLs for this repo", () => {
    const { url } = composeGithubOpen(ABOUT_REPO_URL, "[bug] Desktop report", "hello");
    assert.equal(isAllowedGithubOpen(url), true);
    assert.equal(isAllowedGithubOpen("javascript:alert(1)"), false);
    assert.equal(isAllowedGithubOpen("https://evil.example/issues/new"), false);
    const long = "x".repeat(4000);
    const overflow = composeGithubOpen(ABOUT_REPO_URL, "t", long, 100);
    assert.equal(overflow.copiedBody, true);
    assert.equal(overflow.url.includes("body="), false);
  });
});
