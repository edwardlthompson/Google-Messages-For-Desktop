import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isEphemeralProfile,
  parseProfileId,
  sessionPartitionForProfile,
} from "./sessionProfile.ts";

describe("sessionPartitionForProfile", () => {
  it("keeps persist:main for the default profile and isolates others", () => {
    assert.equal(parseProfileId("nope"), "main");
    assert.equal(sessionPartitionForProfile("main"), "persist:main");
    assert.equal(sessionPartitionForProfile("work"), "persist:profile-work");
    assert.equal(sessionPartitionForProfile("personal"), "persist:profile-personal");
    assert.equal(sessionPartitionForProfile("guest"), "guest");
    assert.equal(isEphemeralProfile("guest"), true);
    assert.equal(isEphemeralProfile("main"), false);
  });
});
