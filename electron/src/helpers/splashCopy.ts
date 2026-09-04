import { catalogEs } from "./catalogEs.ts";
import { localizedCatalog } from "./i18n.ts";

export const splashCopyEn = {
  "splash.heading": "Google Messages",
  "splash.lede": "Starting desktop app…",
  "splash.stage.app": "App",
  "splash.stage.app_loaded": "App Loaded ✅",
  "splash.stage.messages": "Google Messages loading…",
  "splash.stage.messages_ready": "Google Messages ready ✅",
  "splash.stage.hint":
    "The desktop shell is ready; waiting on Google’s web app and phone link. Later, minimize to tray for instant reopen.",
};

export const splashCopy = localizedCatalog(splashCopyEn, catalogEs);
