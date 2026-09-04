import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  nextSplashStage,
  splashStageProgress,
  splashStageRank,
} from "./splashStages.ts";

describe("nextSplashStage", () => {
  it("advances monotonically and ignores regress", () => {
    assert.equal(nextSplashStage(null, "app_ready"), "app_ready");
    assert.equal(
      nextSplashStage("messages_loading", "app_ready"),
      "messages_loading"
    );
    assert.equal(
      nextSplashStage("app_ready", "messages_ready"),
      "messages_ready"
    );
    assert.equal(nextSplashStage("app_ready", "nope"), "app_ready");
  });
});

describe("splashStageProgress", () => {
  it("fills to 1 when messages are ready", () => {
    assert.ok(splashStageRank("messages_ready") > splashStageRank("app_ready"));
    assert.equal(splashStageProgress("messages_ready"), 1);
    assert.ok(splashStageProgress("app_ready") < 1);
  });
});
