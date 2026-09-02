import { expect, test } from "@playwright/test";
import { protocolLaunchFromArgv } from "../src/helpers/jumpList.ts";

test("second-instance argv is a protocol URL or --new-message", () => {
  expect(protocolLaunchFromArgv(["electron.exe", "sms:+15551212121"])).toBe(
    "sms:+15551212121"
  );
  expect(protocolLaunchFromArgv(["electron.exe", "--new-message"])).toBe("im:");
});
