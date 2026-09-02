import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isNewMessageArg,
  jumpListRecentItems,
  parsePhoneList,
  protocolLaunchFromArgv,
  rememberProtocolNumber,
} from "./jumpList.ts";

describe("jumpList", () => {
  it("parses argv, recent numbers, and hides them when asked", () => {
    assert.equal(isNewMessageArg(["app", "--new-message"]), true);
    assert.equal(protocolLaunchFromArgv(["app", "--new-message"]), "im:");
    assert.equal(protocolLaunchFromArgv(["app", "sms:+15551212121"]), "sms:+15551212121");
    assert.equal(isNewMessageArg(["app"]), false);
    assert.deepEqual(parsePhoneList(["+15551212", "nope", "+15551212"]), ["+15551212"]);
    assert.deepEqual(rememberProtocolNumber(["+15550000"], "+15551212")[0], "+15551212");
    assert.equal(jumpListRecentItems(["+15551212"], true).length, 0);
    assert.equal(jumpListRecentItems(["+15551212"], false)[0].args, "sms:+15551212");
  });
});
