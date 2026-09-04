import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export type SplashCopyQuery = {
  heading: string;
  lede: string;
  labelApp: string;
  labelAppDone: string;
  labelMsg: string;
  labelMsgDone: string;
  hint: string;
};

export type SplashLoadTarget = {
  htmlPath: string;
  query: Record<string, string>;
};

export function splashResourceFiles(resourcesPath: string): {
  html: string;
  script: string;
  hero: string;
  logo: string;
} {
  return {
    html: path.join(resourcesPath, "splash.html"),
    script: path.join(resourcesPath, "splash-ui.js"),
    hero: path.join(resourcesPath, "splash-hero.jpg"),
    logo: path.join(resourcesPath, "icons", "256x256.png"),
  };
}

/** Query for splash.html so the stage bar is in the first HTML parse (no JPEG inline). */
export function buildSplashQuery(
  copy: SplashCopyQuery,
  heroUrl: string,
  logoUrl: string
): Record<string, string> {
  return {
    heading: copy.heading,
    lede: copy.lede,
    hero: heroUrl,
    logo: logoUrl,
    labelApp: copy.labelApp,
    labelAppDone: copy.labelAppDone,
    labelMsg: copy.labelMsg,
    labelMsgDone: copy.labelMsgDone,
    hint: copy.hint,
  };
}

/**
 * Copy splash HTML/JS/images out of asar so `file:` hero + relative script load.
 * 111KB JPEG copy is milliseconds; first paint is the small HTML, not a data URL.
 */
export function stageSplashFiles(
  resourcesPath: string,
  destDir: string,
  copy: SplashCopyQuery
): SplashLoadTarget {
  const src = splashResourceFiles(resourcesPath);
  fs.mkdirSync(destDir, { recursive: true });
  const htmlPath = path.join(destDir, "splash.html");
  fs.copyFileSync(src.html, htmlPath);
  fs.copyFileSync(src.script, path.join(destDir, "splash-ui.js"));
  const heroPath = path.join(destDir, "splash-hero.jpg");
  const logoPath = path.join(destDir, "logo.png");
  fs.copyFileSync(src.hero, heroPath);
  fs.copyFileSync(src.logo, logoPath);
  return {
    htmlPath,
    query: buildSplashQuery(
      copy,
      pathToFileURL(heroPath).href,
      pathToFileURL(logoPath).href
    ),
  };
}
