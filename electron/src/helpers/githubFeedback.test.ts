import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  composeGithubIssueUrl,
  crashIssueTitle,
  isPlaceholderRepo,
  searchDuplicateIssues,
  shouldSearchGithub,
} from "./githubFeedback.ts";

describe("crashIssueTitle", () => {
  it("matches the Golden Path crash title contract", () => {
    assert.equal(
      crashIssueTitle("a1b2c3d4e5f6", "TypeError"),
      "[crash] a1b2c3d4e5f6 TypeError"
    );
  });
});

describe("isPlaceholderRepo / search cooldown", () => {
  it("does not fetch placeholder repos or a second search inside 60s", async () => {
    assert.equal(isPlaceholderRepo("owner/repo"), true);
    assert.equal(isPlaceholderRepo("acme/app"), false);
    assert.equal(shouldSearchGithub(1000, 2000, 60_000), false);
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      return { ok: true, status: 200, json: async () => ({ items: [] }) };
    };
    await searchDuplicateIssues(fetchImpl, "acme/app", "q", 0, 1_000);
    await searchDuplicateIssues(fetchImpl, "acme/app", "q", 1_000, 2_000);
    assert.equal(calls, 1);
  });

  it("returns [] on 403, timeout, and placeholder", async () => {
    const forbidden = async () => ({
      ok: false,
      status: 403,
      json: async () => ({}),
    });
    const a = await searchDuplicateIssues(forbidden, "acme/app", "q", 0, 1);
    assert.deepEqual(a.items, []);
    const boom = async () => {
      throw new Error("timeout");
    };
    const b = await searchDuplicateIssues(boom, "acme/app", "q", 0, 1);
    assert.deepEqual(b.items, []);
    const c = await searchDuplicateIssues(forbidden, "owner/repo", "q", 0, 1);
    assert.deepEqual(c.items, []);
  });
});

describe("composeGithubIssueUrl", () => {
  it("stays on https GitHub and copies oversized bodies", () => {
    const small = composeGithubIssueUrl("acme/app", "t", "hello");
    assert.match(small.url, /^https:\/\/github.com\/acme\/app\/issues\/new/);
    const overflow = composeGithubIssueUrl("acme/app", "t", "x".repeat(4000), 80);
    assert.equal(overflow.copiedBody, true);
    assert.equal(overflow.url.includes("body="), false);
  });
});
