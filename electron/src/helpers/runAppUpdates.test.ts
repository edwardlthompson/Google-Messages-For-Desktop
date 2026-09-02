import assert from "node:assert/strict";
import { describe, it } from "node:test";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { MS_DAY } from "./productUpdate.ts";
import { decideForcedUpdateCheck, decideLaunchPrompt } from "./runAppUpdates.ts";
import { createFilePrefsStore } from "./updatePrefs.ts";

function tempStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gmfd-update-prefs-"));
  return { dir, prefs: createFilePrefsStore(dir) };
}

const newerRelease = async () => ({
  htmlUrl: "https://example.com/releases",
  tagName: "v1.8.2",
  assets: [
    {
      name: "Google.Messages-v1.8.2-win-x64.exe",
      url: "https://example.com/setup.exe",
    },
  ],
});

describe("decideLaunchPrompt", () => {
  it("records the first-run version and does not donate", async () => {
    const { prefs } = tempStore();
    const prompt = await decideLaunchPrompt(
      "1.8.1",
      prefs,
      0,
      async () => null
    );
    assert.equal(prompt, null);
    assert.equal(prefs.load().lastSeenVersion, "1.8.1");
  });

  it("nudges donate only after a version change", async () => {
    const { prefs } = tempStore();
    prefs.markVersionSeen("1.8.1");
    const donate = await decideLaunchPrompt(
      "1.8.2",
      prefs,
      0,
      newerRelease
    );
    assert.deepEqual(donate, { kind: "donate" });
    assert.equal(prefs.load().lastSeenVersion, "1.8.1");

    prefs.markVersionSeen("1.8.2");
    const again = await decideLaunchPrompt("1.8.2", prefs, 0, newerRelease);
    assert.notEqual(again?.kind, "donate");
  });

  it("prompts once for a newer installer and honors Later", async () => {
    const { prefs } = tempStore();
    prefs.markVersionSeen("1.8.1");
    const prompt = await decideLaunchPrompt(
      "1.8.1",
      prefs,
      MS_DAY,
      newerRelease
    );
    assert.deepEqual(prompt, {
      kind: "update",
      version: "1.8.2",
      url: "https://example.com/setup.exe",
      filename: "Google.Messages-v1.8.2-win-x64.exe",
    });

    prefs.markUpdateChecked(MS_DAY, "1.8.2");
    const dismissed = await decideLaunchPrompt(
      "1.8.1",
      prefs,
      MS_DAY * 3,
      newerRelease
    );
    assert.equal(dismissed, null);
  });

  it("stays silent inside the daily interval", async () => {
    const { prefs } = tempStore();
    prefs.markVersionSeen("1.8.1");
    prefs.markUpdateChecked(0);
    const prompt = await decideLaunchPrompt(
      "1.8.1",
      prefs,
      MS_DAY - 1,
      newerRelease
    );
    assert.equal(prompt, null);
  });

  it("skips installer fetch when launch checks are off", async () => {
    const { prefs } = tempStore();
    prefs.markVersionSeen("1.8.1");
    let fetched = 0;
    const prompt = await decideLaunchPrompt(
      "1.8.1",
      prefs,
      MS_DAY,
      async () => {
        fetched += 1;
        return newerRelease();
      },
      "exe",
      false
    );
    assert.equal(prompt, null);
    assert.equal(fetched, 0);
  });
});

describe("decideForcedUpdateCheck", () => {
  it("stays silent when the fetch fails", async () => {
    const { prefs } = tempStore();
    const result = await decideForcedUpdateCheck(
      "1.8.1",
      prefs,
      0,
      async () => null
    );
    assert.equal(result.kind, "failed");
  });

  it("reports current when the installer is not newer", async () => {
    const { prefs } = tempStore();
    const result = await decideForcedUpdateCheck(
      "1.8.2",
      prefs,
      0,
      newerRelease
    );
    assert.deepEqual(result, { kind: "current", version: "1.8.2" });
  });

  it("still offers a newer installer after Later when ignoreDismissed", async () => {
    const { prefs } = tempStore();
    prefs.markUpdateChecked(0, "1.8.2");
    const hidden = await decideForcedUpdateCheck(
      "1.8.1",
      prefs,
      0,
      newerRelease,
      "exe",
      false
    );
    assert.deepEqual(hidden, { kind: "current", version: "1.8.2" });
    const offered = await decideForcedUpdateCheck(
      "1.8.1",
      prefs,
      0,
      newerRelease,
      "exe",
      true
    );
    assert.equal(offered.kind, "update");
    if (offered.kind === "update") {
      assert.equal(offered.version, "1.8.2");
      assert.equal(offered.url, "https://example.com/setup.exe");
    }
  });

  it("uses the git tag when no OS installer filename matches", async () => {
    const { prefs } = tempStore();
    const result = await decideForcedUpdateCheck(
      "1.8.1",
      prefs,
      0,
      async () => ({
        htmlUrl: "https://example.com/r",
        tagName: "v1.9.1",
        assets: [
          {
            name: "Google.Messages-v1.9.1-win-x64.zip",
            url: "https://example.com/zip",
          },
        ],
      })
    );
    assert.deepEqual(result, {
      kind: "update",
      version: "1.9.1",
      url: "https://example.com/r",
      filename: null,
    });
  });
});
