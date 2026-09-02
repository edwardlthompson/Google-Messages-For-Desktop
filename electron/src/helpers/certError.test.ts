import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  certInterstitialQuery,
  hostnameFromUrl,
  isCertificateFailure,
  neverTrustCertificate,
} from "./certError.ts";

describe("neverTrustCertificate", () => {
  it("always denies so TLS is never ignored", () => {
    assert.equal(neverTrustCertificate(), false);
    assert.equal(hostnameFromUrl("https://messages.google.com/web/"), "messages.google.com");
    assert.equal(hostnameFromUrl("not a url"), "");
    assert.deepEqual(certInterstitialQuery("https://a.example/", "ERR_CERT_DATE_INVALID"), {
      host: "a.example",
      error: "ERR_CERT_DATE_INVALID",
    });
    assert.equal(isCertificateFailure(-202, "ERR_CERT_AUTHORITY_INVALID"), true);
    assert.equal(isCertificateFailure(-106, "ERR_INTERNET_DISCONNECTED"), false);
  });
});
