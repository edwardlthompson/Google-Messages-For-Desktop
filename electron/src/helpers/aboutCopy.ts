import { VENMO_DONATE_URL } from "./donate.ts";
import { catalogEs } from "./catalogEs.ts";
import { localizedCatalog } from "./i18n.ts";

export const ABOUT_PRODUCT_NAME = "Google Messages For Desktop";
export const ABOUT_REPO_URL =
  "https://github.com/edwardlthompson/Google-Messages-For-Desktop";
export const ABOUT_ORANGE_URL =
  "https://github.com/OrangeDrangon/android-messages-desktop";
export const ABOUT_KELYVIN_URL =
  "https://github.com/kelyvin/Google-Messages-For-Desktop";

export const aboutCopyEn = {
  "about.name": ABOUT_PRODUCT_NAME,
  "about.tagline": "Messages for web, as a desktop app.",
  "about.foss": "FOSS under the MIT License. No tracking in this wrapper.",
  "about.disclaimer": "Not affiliated with Google. Android is a trademark of Google LLC.",
  "about.credit.orange": "Electron shell based on OrangeDrangon/android-messages-desktop (MIT).",
  "about.notice": "License notice: electron/NOTICE-ORANGEDRANGON.txt",
  "about.credit.kelyvin": "Upstream history: kelyvin/Google-Messages-For-Desktop.",
  "about.protocols":
    "This app adds sms:/tel:/smsto:/callto:/im:/mms: handlers that start a new text.",
  "about.donate": "Donate via Venmo",
};

export const aboutCopy = localizedCatalog(aboutCopyEn, catalogEs);

const localeStyle =
  "-webkit-app-region: no-drag; position: absolute; left: 0.5em; bottom: 0.5em; font-size: 12px; color: #999";

export function aboutDescriptionHtml(locale: string): string {
  const lang = locale.trim() || "";
  return `${aboutCopy["about.tagline"]} <a href="${ABOUT_REPO_URL}">Github Repo</a><span style="${localeStyle}">${lang}</span>`;
}

export function aboutCopyrightHtml(): string {
  const donate = `<a href="${VENMO_DONATE_URL}">${aboutCopy["about.donate"]}</a>`;
  const orange = `<a href="${ABOUT_ORANGE_URL}">OrangeDrangon/android-messages-desktop</a>`;
  const kelyvin = `<a href="${ABOUT_KELYVIN_URL}">kelyvin/Google-Messages-For-Desktop</a>`;
  return [
    `<div style="text-align: center">Copyright Google Messages For Desktop contributors`,
    `<br><br>${aboutCopy["about.disclaimer"]}`,
    `<br><br>${aboutCopy["about.credit.orange"]} (${orange})`,
    `<br>${aboutCopy["about.credit.kelyvin"]} (${kelyvin})`,
    `<br>${aboutCopy["about.notice"]}`,
    `<br><br>${aboutCopy["about.protocols"]}`,
    `<br><br>Support development: ${donate}`,
    `<br><br>${ABOUT_PRODUCT_NAME} is released under the MIT License.</div>`,
  ].join("");
}
