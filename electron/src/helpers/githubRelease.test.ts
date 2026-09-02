import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fetchLatestGithubRelease, parseGithubRelease } from "./githubRelease.ts";

describe("parseGithubRelease", () => {
  it("ignores empty or malformed payloads", () => {
    assert.equal(parseGithubRelease(null), null);
    assert.deepEqual(
      parseGithubRelease({ html_url: "https://example.com/r", assets: [] })
        ?.assets,
      []
    );
  });

  it("keeps named download URLs", () => {
    const parsed = parseGithubRelease({
      html_url: "https://example.com/r",
      tag_name: "v1.8.2",
      assets: [
        {
          name: "Google.Messages-v1.8.2-win-x64.exe",
          browser_download_url: "https://example.com/e",
        },
      ],
    });
    assert.equal(parsed?.htmlUrl, "https://example.com/r");
    assert.equal(parsed?.tagName, "v1.8.2");
    assert.equal(parsed?.assets[0]?.url, "https://example.com/e");
  });
});

describe("fetchLatestGithubRelease", () => {
  it("returns null on timeout or non-OK", async () => {
    const failed = await fetchLatestGithubRelease("1.8.1", async () => {
      throw new Error("network");
    });
    assert.equal(failed, null);

    const notOk = await fetchLatestGithubRelease("1.8.1", async () => {
      return new Response("nope", { status: 404 });
    });
    assert.equal(notOk, null);
  });
});
