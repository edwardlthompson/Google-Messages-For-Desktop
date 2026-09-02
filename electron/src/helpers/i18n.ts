export type Catalog = Record<string, string>;

let activeLanguage = "en";

export function languageFromLocale(locale: string): string {
  const normalized = locale.trim().toLowerCase().replace(/_/g, "-");
  const primary = normalized.split("-")[0] || "en";
  if (primary === "es") return "es";
  return "en";
}

export function setActiveLanguage(locale: string): void {
  activeLanguage = languageFromLocale(locale);
}

export function getActiveLanguage(): string {
  return activeLanguage;
}

export function formatCopy(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => vars[key] ?? "");
}

export function lookupCopy(
  key: string,
  english: Catalog,
  overlay: Catalog
): string {
  if (activeLanguage !== "en") {
    const translated = overlay[key];
    if (translated) return translated;
  }
  return english[key] ?? key;
}

export function localizedCatalog<T extends Catalog>(
  english: T,
  overlay: Catalog
): T {
  return new Proxy(english, {
    get(target, prop) {
      if (typeof prop !== "string") return Reflect.get(target, prop);
      return lookupCopy(prop, target, overlay);
    },
  }) as T;
}
