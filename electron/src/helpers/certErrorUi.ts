import path from "path";
import { app } from "electron";
import { RESOURCES_PATH } from "./constants";
import { certInterstitialQuery, neverTrustCertificate } from "./certError";

export function bindCertErrorInterstitial(): void {
  app.on(
    "certificate-error",
    (_event, webContents, url, error, _certificate, callback) => {
      callback(neverTrustCertificate());
      if (webContents.isDestroyed()) return;
      const dest = path.resolve(RESOURCES_PATH, "cert-error.html");
      void webContents.loadFile(dest, {
        query: certInterstitialQuery(url, error),
      });
    }
  );
}
