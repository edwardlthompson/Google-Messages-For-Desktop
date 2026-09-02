import { expect, test } from "@playwright/test";
import {
  HIDDEN_NOTIFY_BODY,
  HIDDEN_NOTIFY_TITLE,
  sanitizePayload,
} from "../src/helpers/osNotificationLogic.ts";

test("Hide Content redacts toast title and body", () => {
  const payload = sanitizePayload("Ada", "secret body", true);
  expect(payload.title).toBe(HIDDEN_NOTIFY_TITLE);
  expect(payload.body).toBe(HIDDEN_NOTIFY_BODY);
  expect(payload.title).not.toMatch(/Ada/i);
  expect(payload.body).not.toMatch(/secret/i);
});
