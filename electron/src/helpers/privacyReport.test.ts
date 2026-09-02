import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeReportText } from "./privacyReport.ts";
import { buildReportMarkdown, fingerprintCrash } from "./privacyReportBuild.ts";

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.signaturepart";
const STACK =
  "TypeError: boom\n    at C:\\Users\\Ada\\secret.env:1\n" +
  "token=ghp_abcdefghijklmnopqrstuvwxyz012345\n" +
  `${JWT}\nAKIAIOSFODNN7EXAMPLE\n`;

describe("sanitizeReportText", () => {
  it("turns null into empty and redacts secrets plus home paths", () => {
    assert.equal(sanitizeReportText(null), "");
    const out = sanitizeReportText(STACK, true);
    assert.equal(out.includes("Ada"), false);
    assert.equal(out.includes("ghp_"), false);
    assert.equal(out.includes("eyJ"), false);
    assert.equal(out.includes("AKIA"), false);
    assert.match(out, /<redacted-secret>/);
    assert.match(out, /<redacted-home>/);
  });
});

describe("fingerprintCrash / markdown", () => {
  it("keeps a stable fingerprint when only the username changes", () => {
    const a = fingerprintCrash("Error\n    at C:\\Users\\Ada\\app\\main.ts:1");
    const b = fingerprintCrash("Error\n    at C:\\Users\\Bob\\app\\main.ts:1");
    assert.equal(a, b);
    assert.equal(a.length, 12);
  });

  it("builds markdown without tokens", () => {
    const md = buildReportMarkdown(
      "crash",
      "user ghp_abcdefghijklmnopqrstuvwxyz012345 leaked"
    );
    assert.equal(md.includes("ghp_"), false);
    assert.match(md, /crash/);
  });
});
