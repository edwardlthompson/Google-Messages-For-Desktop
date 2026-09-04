import { BehaviorSubject } from "rxjs";
import jetpack from "fs-jetpack";
import process from "process";
import { SETTINGS_FILE } from "./constants";
import { parseCloseAction } from "./closeBehavior";
import { isQuietHoursPreset } from "./quietHours";
import { clampZoomFactor } from "./windowPrefs";
import { parseSpellCheckLanguage } from "./spellcheckLang";
import { parseDensityPreset } from "./densityCss";
import { parseUnreadBadgeColor } from "./unreadBadge";
import { parseThemePref, type ThemePref } from "./settingsTheme";
import { parseProfileId } from "./sessionProfile";
import { parseSignature, parseSnippet } from "./composeExtras";
import { parseZoomByDisplayScale } from "./windowPrefs";
import { parsePhoneList } from "./jumpList";
import { parseMutedToastTitles } from "./liveRegion";

// base types in json
type primative = null | boolean | number | string;
// expression of json arrays
type jsonArr = validJson[];
// recursive interface with all valid expressions of json inside of an object
interface json {
  [key: string]: json | primative | jsonArr;
}

// a complete expression of json including root arrays, primatives, and objects
type validJson = primative | jsonArr | json;

export type Setting<T extends validJson> = BehaviorSubject<T>;

function getSetting(key: string): validJson | undefined {
  return (jetpack.read(SETTINGS_FILE(), "json") || {})[key];
}

/**
 *
 * initial must be a json serializable type
 *
 * @param key name of setting
 * @param initial initial value if unset
 */
function createSetting<T>(key: string, initial: T): BehaviorSubject<T> {
  const savedVal = getSetting(key);
  const val = savedVal != null ? savedVal : initial;
  return new BehaviorSubject(val) as BehaviorSubject<T>;
}

export interface JsonSettings {
  trayEnabled: boolean;
  hideNotificationContentEnabled: boolean;
  startInTrayEnabled: boolean;
  autoHideMenuEnabled: boolean;
  seenMinimizeToTrayWarning: boolean;
  onboardingCompleted: boolean;
  signInGuidanceCompleted: boolean;
  savedWindowSize: WindowSize;
  savedWindowPosition: WindowPosition | null;
  checkForUpdateOnLaunchEnabled: boolean;
  monochromeIconEnabled: boolean;
  showIconsInRecentConversationTrayEnabled: boolean;
  taskbarFlashEnabled: boolean;
  trayIconRedDotEnabled: boolean;
  spellCheckEnabled: boolean;
  /** One-time Windows rollout: force tray on for notify/unread badge feature. */
  windowsTrayRolloutV1: boolean;
  /** Opt-in local crash queue; default off. See crash-capture. */
  saveCrashDetailsEnabled: boolean;
  /** Native chrome theme; Google Messages web keeps its own appearance. */
  themePreference: ThemePref;
  /** Open the app when the user signs into the OS. */
  startWithOsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursPreset: string;
  notificationSoundEnabled: boolean;
  alwaysOnTopEnabled: boolean;
  savedZoomFactor: number;
  closeActionPreference: string;
  hardwareAccelerationEnabled: boolean;
  userCssEnabled: boolean;
  spellCheckLanguage: string;
  customDownloadsPath: string;
  verboseMainLogEnabled: boolean;
  reduceMotionEnabled: boolean;
  densityPreset: string;
  customTrayIconPath: string;
  unreadBadgeColor: string;
  windowsMicaEnabled: boolean;
  wrapperMuteHotkeyEnabled: boolean;
  activeProfileId: string;
  cannedSnippet1: string;
  cannedSnippet2: string;
  cannedSnippet3: string;
  protocolSignature: string;
  confirmProtocolCompose: boolean;
  zoomByDisplayScale: { [key: string]: number };
  lastProtocolNumbers: string[];
  mutedToastTitles: string[];
}

// wraps json settings in the setting type for export
export type Settings = {
  [P in keyof JsonSettings]: Setting<JsonSettings[P]>;
};

type WindowSize = {
  width: number;
  height: number;
};

type WindowPosition = {
  x: number;
  y: number;
};

// default settings for the app
export const defaultSettings: JsonSettings = {
  // Windows: tray on by default so unread red-dot works for new installs.
  trayEnabled: process.platform === "win32",
  hideNotificationContentEnabled: true,
  startInTrayEnabled: false,
  autoHideMenuEnabled: false,
  seenMinimizeToTrayWarning: false,
  onboardingCompleted: false,
  signInGuidanceCompleted: false,
  savedWindowSize: { width: 1100, height: 800 },
  savedWindowPosition: null,
  checkForUpdateOnLaunchEnabled: false,
  // Color icon is far more visible in the Windows notification area.
  monochromeIconEnabled: process.platform !== "win32",
  showIconsInRecentConversationTrayEnabled: true,
  taskbarFlashEnabled: true,
  trayIconRedDotEnabled: true,
  spellCheckEnabled: true,
  windowsTrayRolloutV1: false,
  saveCrashDetailsEnabled: false,
  themePreference: "system",
  startWithOsEnabled: false,
  quietHoursEnabled: false,
  quietHoursPreset: "22-07",
  notificationSoundEnabled: true,
  alwaysOnTopEnabled: false,
  savedZoomFactor: 1,
  closeActionPreference: "tray",
  hardwareAccelerationEnabled: true,
  userCssEnabled: false,
  spellCheckLanguage: "en-US",
  customDownloadsPath: "",
  verboseMainLogEnabled: false,
  reduceMotionEnabled: false,
  densityPreset: "default",
  customTrayIconPath: "",
  unreadBadgeColor: "red",
  windowsMicaEnabled: false,
  wrapperMuteHotkeyEnabled: true,
  activeProfileId: "main",
  cannedSnippet1: "",
  cannedSnippet2: "",
  cannedSnippet3: "",
  protocolSignature: "",
  confirmProtocolCompose: true,
  zoomByDisplayScale: {},
  lastProtocolNumbers: [],
  mutedToastTitles: [],
};

// create default settings file if it doesnt exist
if (!jetpack.exists(SETTINGS_FILE())) {
  jetpack.write(SETTINGS_FILE(), defaultSettings);
}

// temporary settings object during creation
// This is ok because this object is holding stuff derived from the loop of defaultSettings
// There may be an elegant way to express the type but I do not know it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const settingsToExport: any = {};

// loop through and create all the settings
for (const name in defaultSettings) {
  const key = name as keyof Settings;
  const setting = createSetting(name, defaultSettings[key]);
  settingsToExport[key] = setting;
}

// We know this is safe because we are enumerating all of the settings in default settings
// furthermore the `Settings` type is derived from the default settings type
export const settings: Settings = settingsToExport as Settings;
let settingsFlushEnabled = true;

export const setSettingsFlushEnabled = (val: boolean) => {
  settingsFlushEnabled = val;
};

// loop through and add all the event listeners
// has to be done in this step because settings needs to exist
for (const name in settings) {
  const key = name as keyof Settings;
  // cast to unknown type to quell the compiler
  const setting = settings[key] as BehaviorSubject<unknown>;
  setting.subscribe(() => {
    // create a settings object unwrapped from the subjects
    const seriazableSettings: Record<string, validJson> = {};
    Object.entries(settings).forEach(([name, setting]) => {
      seriazableSettings[name] = setting.value;
    });
    // write all the settings to the file from memory to avoid weird read write race conditions
    if (settingsFlushEnabled) {
      jetpack.write(SETTINGS_FILE(), seriazableSettings);
    }
  });
}

settings.themePreference.next(parseThemePref(settings.themePreference.value));
settings.savedZoomFactor.next(clampZoomFactor(settings.savedZoomFactor.value));
settings.closeActionPreference.next(
  parseCloseAction(settings.closeActionPreference.value)
);
if (!isQuietHoursPreset(settings.quietHoursPreset.value)) {
  settings.quietHoursPreset.next("22-07");
}
settings.spellCheckLanguage.next(
  parseSpellCheckLanguage(settings.spellCheckLanguage.value)
);
settings.densityPreset.next(parseDensityPreset(settings.densityPreset.value));
settings.unreadBadgeColor.next(
  parseUnreadBadgeColor(settings.unreadBadgeColor.value)
);
settings.activeProfileId.next(parseProfileId(settings.activeProfileId.value));
settings.cannedSnippet1.next(parseSnippet(settings.cannedSnippet1.value));
settings.cannedSnippet2.next(parseSnippet(settings.cannedSnippet2.value));
settings.cannedSnippet3.next(parseSnippet(settings.cannedSnippet3.value));
settings.protocolSignature.next(parseSignature(settings.protocolSignature.value));
settings.zoomByDisplayScale.next(
  parseZoomByDisplayScale(settings.zoomByDisplayScale.value)
);
settings.lastProtocolNumbers.next(
  parsePhoneList(settings.lastProtocolNumbers.value)
);
settings.mutedToastTitles.next(
  parseMutedToastTitles(settings.mutedToastTitles.value)
);

// One-time Windows rollout: existing installs still had trayEnabled=false from
// before OS notify / unread badge. Force tray + color icon once; users can
// disable again via Settings → Enable Tray Icon.
if (
  process.platform === "win32" &&
  !settings.windowsTrayRolloutV1.value
) {
  settings.trayEnabled.next(true);
  settings.monochromeIconEnabled.next(false);
  settings.windowsTrayRolloutV1.next(true);
}
