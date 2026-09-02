import { app } from "electron";
import { setActiveLanguage } from "./i18n";

export function bindAppLocale(locale?: string): void {
  setActiveLanguage(locale ?? app.getLocale());
}
