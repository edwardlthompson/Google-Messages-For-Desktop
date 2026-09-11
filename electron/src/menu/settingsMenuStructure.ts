/**
 * Pure outline of the nested Settings menu (no Electron imports).
 * Keep in sync with builders in settingsMenuSections.ts / settingsMenu.ts.
 */

/** Top-level Settings rows in order. `null` = separator. */
export const SETTINGS_TOP_LEVEL_IDS: ReadonlyArray<string | null> = [
  "themePreferenceMenu",
  "densityPresetMenu",
  "profileMenu",
  null,
  "trayIconMenu",
  "notificationsMenu",
  "windowStartupMenu",
  "messagingMenu",
  "spellFilesMenu",
  "dataPrivacyMenu",
  "advancedMenu",
  null,
  "defaultMessagingAppsMenuItem",
  "openWindowsDefaultAppsMenuItem",
];

/** Child item IDs under each section submenu (order matters for docs/tests). */
export const SETTINGS_NESTED_IDS: Readonly<Record<string, readonly string[]>> = {
  trayIconMenu: [
    "enableTrayIconMenuItem",
    "startInTrayMenuItem",
    "monochromeIconEnabledMenuItem",
    "showIconsInRecentConversationTrayEnabledMenuItem",
    "trayIconRedDotEnabledMenuItem",
    "unreadBadgeColorMenu",
    "customTrayIconMenuItem",
    "clearCustomTrayIconMenuItem",
  ],
  notificationsMenu: [
    "hideNotificationContentMenuItem",
    "notificationSoundEnabledMenuItem",
    "quietHoursMenu",
    "taskbarFlashEnabledMenuItem",
  ],
  windowStartupMenu: [
    "autoHideMenuBarMenuItem",
    "alwaysOnTopMenuItem",
    "reduceMotionMenuItem",
    "closeActionMenu",
    "resetWindowMenuItem",
    "startWithOsEnabledMenuItem",
    "hardwareAccelerationMenuItem",
    "windowsMicaMenuItem",
    "wrapperMuteHotkeyMenuItem",
  ],
  messagingMenu: [
    "confirmProtocolComposeMenuItem",
    "copySnippet1MenuItem",
    "copySnippet2MenuItem",
    "copySnippet3MenuItem",
    "saveSnippet1MenuItem",
    "saveSnippet2MenuItem",
    "saveSnippet3MenuItem",
    "saveSignatureMenuItem",
    "muteToastClipboardMenuItem",
  ],
  spellFilesMenu: [
    "spellCheckEnabledMenuItem",
    "spellCheckLanguageMenu",
    "chooseDownloadsMenuItem",
  ],
  dataPrivacyMenu: [
    "userCssEnabledMenuItem",
    "openUserCssMenuItem",
    "exportSettingsMenuItem",
    "importSettingsMenuItem",
    "resetAllSettingsMenuItem",
    "signOutSessionMenuItem",
  ],
  advancedMenu: [
    "verboseMainLogMenuItem",
    "openMainLogMenuItem",
    "saveCrashDetailsEnabledMenuItem",
    "proxyStatusMenuItem",
    "checkForUpdateOnLaunchMenuItem",
  ],
};

export function settingsTopLevelRowCount(): number {
  return SETTINGS_TOP_LEVEL_IDS.length;
}

export function settingsTopLevelInteractiveCount(): number {
  return SETTINGS_TOP_LEVEL_IDS.filter((id) => id != null).length;
}
