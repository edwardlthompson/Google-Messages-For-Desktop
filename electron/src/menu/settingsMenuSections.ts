import {
  BaseWindow,
  MenuItem,
  MenuItemConstructorOptions,
} from "electron";
import { IS_MAC, IS_WINDOWS } from "../helpers/constants";
import { settingsCopy } from "../helpers/settingsCopy";
import { settings } from "../helpers/settings";
import { getMainWindow } from "../helpers/getMainWindow";
import { resetWindowSizeAndPosition } from "../helpers/windowPrefsUi";
import { proxyStatusLine } from "../helpers/proxyStatus";
import {
  exportSettingsJson,
  importSettingsJson,
  openUserCssFile,
  resetAllSettings,
  signOutMessagesSession,
} from "../helpers/settingsIoUi";
import { openMainLogFile } from "../helpers/verboseLogUi";
import { chooseDownloadsFolder } from "../helpers/downloadsUi";
import {
  chooseCustomTrayIcon,
  clearCustomTrayIcon,
} from "../helpers/customTrayIconUi";
import {
  copySnippet,
  saveClipboardAsMutedToast,
  saveClipboardAsSignature,
  saveClipboardAsSnippet,
} from "../helpers/composeExtrasUi";
import { SPELLCHECK_LANGS } from "../helpers/spellcheckLang";

const {
  autoHideMenuEnabled,
  trayEnabled,
  startInTrayEnabled,
  hideNotificationContentEnabled,
  monochromeIconEnabled,
  showIconsInRecentConversationTrayEnabled,
  trayIconRedDotEnabled,
  taskbarFlashEnabled,
  spellCheckEnabled,
  spellCheckLanguage,
  saveCrashDetailsEnabled,
  checkForUpdateOnLaunchEnabled,
  startWithOsEnabled,
  quietHoursEnabled,
  quietHoursPreset,
  notificationSoundEnabled,
  alwaysOnTopEnabled,
  reduceMotionEnabled,
  closeActionPreference,
  hardwareAccelerationEnabled,
  unreadBadgeColor,
  windowsMicaEnabled,
  wrapperMuteHotkeyEnabled,
  confirmProtocolCompose,
  userCssEnabled,
  verboseMainLogEnabled,
} = settings;

export function trayIconSubmenu(): MenuItemConstructorOptions {
  return {
    id: "trayIconMenu",
    label: settingsCopy["settings.section.tray"],
    submenu: [
      {
        id: "enableTrayIconMenuItem",
        label: IS_MAC
          ? settingsCopy["settings.tray_mac"]
          : settingsCopy["settings.tray"],
        type: "checkbox",
        checked: trayEnabled.value,
        click: async (item: MenuItem): Promise<void> =>
          trayEnabled.next(item.checked),
        toolTip: IS_WINDOWS ? settingsCopy["settings.tray_tooltip"] : undefined,
      },
      {
        id: "startInTrayMenuItem",
        label: IS_MAC
          ? settingsCopy["settings.start_hidden"]
          : settingsCopy["settings.start_in_tray"],
        type: "checkbox",
        checked: startInTrayEnabled.value,
        enabled: trayEnabled.value,
        click: (item: MenuItem): void => startInTrayEnabled.next(item.checked),
      },
      {
        id: "monochromeIconEnabledMenuItem",
        label: settingsCopy["settings.mono_tray"],
        type: "checkbox",
        checked: monochromeIconEnabled.value,
        enabled: trayEnabled.value,
        click: (item) => monochromeIconEnabled.next(item.checked),
      },
      {
        id: "showIconsInRecentConversationTrayEnabledMenuItem",
        label: settingsCopy["settings.tray_icons"],
        type: "checkbox",
        checked: showIconsInRecentConversationTrayEnabled.value,
        enabled: trayEnabled.value,
        click: (item) =>
          showIconsInRecentConversationTrayEnabled.next(item.checked),
      },
      {
        id: "trayIconRedDotEnabledMenuItem",
        label: settingsCopy["settings.red_dot"],
        type: "checkbox",
        checked: trayIconRedDotEnabled.value,
        enabled: trayEnabled.value,
        click: (item) => trayIconRedDotEnabled.next(item.checked),
      },
      {
        id: "unreadBadgeColorMenu",
        label: settingsCopy["settings.badge_color"],
        enabled: trayEnabled.value,
        submenu: [
          {
            id: "unreadBadgeRedMenuItem",
            label: settingsCopy["settings.badge_red"],
            type: "radio",
            checked: unreadBadgeColor.value === "red",
            click: (): void => unreadBadgeColor.next("red"),
          },
          {
            id: "unreadBadgeAccentMenuItem",
            label: settingsCopy["settings.badge_accent"],
            type: "radio",
            checked: unreadBadgeColor.value === "accent",
            click: (): void => unreadBadgeColor.next("accent"),
          },
        ],
      },
      {
        id: "customTrayIconMenuItem",
        label: settingsCopy["settings.custom_tray"],
        click: (): void => {
          void chooseCustomTrayIcon();
        },
      },
      {
        id: "clearCustomTrayIconMenuItem",
        label: settingsCopy["settings.custom_tray_clear"],
        click: (): void => clearCustomTrayIcon(),
      },
    ],
  };
}

export function notificationsSubmenu(): MenuItemConstructorOptions {
  return {
    id: "notificationsMenu",
    label: settingsCopy["settings.section.notifications"],
    submenu: [
      {
        id: "hideNotificationContentMenuItem",
        label: settingsCopy["settings.hide_content"],
        type: "checkbox",
        checked: hideNotificationContentEnabled.value,
        click: (item) => hideNotificationContentEnabled.next(item.checked),
      },
      {
        id: "notificationSoundEnabledMenuItem",
        label: settingsCopy["settings.notify_sound"],
        type: "checkbox",
        checked: notificationSoundEnabled.value,
        click: (item) => notificationSoundEnabled.next(item.checked),
      },
      {
        id: "quietHoursMenu",
        label: settingsCopy["settings.quiet_hours"],
        submenu: [
          {
            id: "quietHoursOffMenuItem",
            label: settingsCopy["settings.quiet_hours.off"],
            type: "radio",
            checked: !quietHoursEnabled.value,
            click: (): void => quietHoursEnabled.next(false),
          },
          {
            id: "quietHours2207MenuItem",
            label: settingsCopy["settings.quiet_hours.22_07"],
            type: "radio",
            checked:
              quietHoursEnabled.value && quietHoursPreset.value === "22-07",
            click: (): void => {
              quietHoursEnabled.next(true);
              quietHoursPreset.next("22-07");
            },
          },
          {
            id: "quietHours2108MenuItem",
            label: settingsCopy["settings.quiet_hours.21_08"],
            type: "radio",
            checked:
              quietHoursEnabled.value && quietHoursPreset.value === "21-08",
            click: (): void => {
              quietHoursEnabled.next(true);
              quietHoursPreset.next("21-08");
            },
          },
          {
            id: "quietHours2306MenuItem",
            label: settingsCopy["settings.quiet_hours.23_06"],
            type: "radio",
            checked:
              quietHoursEnabled.value && quietHoursPreset.value === "23-06",
            click: (): void => {
              quietHoursEnabled.next(true);
              quietHoursPreset.next("23-06");
            },
          },
        ],
      },
      {
        id: "taskbarFlashEnabledMenuItem",
        label: settingsCopy["settings.taskbar_flash"],
        type: "checkbox",
        checked: taskbarFlashEnabled.value,
        click: (item) => taskbarFlashEnabled.next(item.checked),
      },
    ],
  };
}

export function windowStartupSubmenu(): MenuItemConstructorOptions {
  return {
    id: "windowStartupMenu",
    label: settingsCopy["settings.section.window"],
    submenu: [
      {
        visible: !IS_MAC,
        id: "autoHideMenuBarMenuItem",
        label: settingsCopy["settings.auto_hide_menu"],
        type: "checkbox",
        checked: autoHideMenuEnabled.value,
        click: (item: MenuItem, window?: BaseWindow): void => {
          autoHideMenuEnabled.next(item.checked);
          window?.setMenuBarVisibility(!autoHideMenuEnabled.value);
          window?.setAutoHideMenuBar(autoHideMenuEnabled.value);
        },
      },
      {
        id: "alwaysOnTopMenuItem",
        label: settingsCopy["settings.always_on_top"],
        type: "checkbox",
        checked: alwaysOnTopEnabled.value,
        click: (item) => alwaysOnTopEnabled.next(item.checked),
      },
      {
        id: "reduceMotionMenuItem",
        label: settingsCopy["settings.reduce_motion"],
        type: "checkbox",
        checked: reduceMotionEnabled.value,
        click: (item) => reduceMotionEnabled.next(item.checked),
      },
      {
        id: "closeActionMenu",
        label: settingsCopy["settings.close_behavior"],
        submenu: [
          {
            id: "closeAskMenuItem",
            label: settingsCopy["settings.close_ask"],
            type: "radio",
            checked: closeActionPreference.value === "ask",
            click: (): void => closeActionPreference.next("ask"),
          },
          {
            id: "closeTrayMenuItem",
            label: settingsCopy["settings.close_tray"],
            type: "radio",
            checked: closeActionPreference.value === "tray",
            click: (): void => closeActionPreference.next("tray"),
          },
          {
            id: "closeQuitMenuItem",
            label: settingsCopy["settings.close_quit"],
            type: "radio",
            checked: closeActionPreference.value === "quit",
            click: (): void => closeActionPreference.next("quit"),
          },
        ],
      },
      {
        id: "resetWindowMenuItem",
        label: settingsCopy["settings.reset_window"],
        click: (): void => {
          const win = getMainWindow();
          if (win) resetWindowSizeAndPosition(win);
        },
      },
      {
        id: "startWithOsEnabledMenuItem",
        label: settingsCopy["settings.start_with_os"],
        type: "checkbox",
        checked: startWithOsEnabled.value,
        click: (item) => startWithOsEnabled.next(item.checked),
      },
      {
        id: "hardwareAccelerationMenuItem",
        label: settingsCopy["settings.hw_accel"],
        type: "checkbox",
        checked: hardwareAccelerationEnabled.value,
        click: (item) => hardwareAccelerationEnabled.next(item.checked),
      },
      {
        visible: IS_WINDOWS,
        id: "windowsMicaMenuItem",
        label: settingsCopy["settings.mica"],
        type: "checkbox",
        checked: windowsMicaEnabled.value,
        click: (item) => windowsMicaEnabled.next(item.checked),
      },
      {
        id: "wrapperMuteHotkeyMenuItem",
        label: settingsCopy["settings.mute_hotkey"],
        type: "checkbox",
        checked: wrapperMuteHotkeyEnabled.value,
        click: (item) => wrapperMuteHotkeyEnabled.next(item.checked),
      },
    ],
  };
}

export function messagingSubmenu(): MenuItemConstructorOptions {
  return {
    id: "messagingMenu",
    label: settingsCopy["settings.section.messaging"],
    submenu: [
      {
        id: "confirmProtocolComposeMenuItem",
        label: settingsCopy["settings.confirm_protocol"],
        type: "checkbox",
        checked: confirmProtocolCompose.value,
        click: (item) => confirmProtocolCompose.next(item.checked),
      },
      {
        id: "copySnippet1MenuItem",
        label: settingsCopy["settings.snippet_copy_1"],
        click: (): void => copySnippet(1),
      },
      {
        id: "copySnippet2MenuItem",
        label: settingsCopy["settings.snippet_copy_2"],
        click: (): void => copySnippet(2),
      },
      {
        id: "copySnippet3MenuItem",
        label: settingsCopy["settings.snippet_copy_3"],
        click: (): void => copySnippet(3),
      },
      {
        id: "saveSnippet1MenuItem",
        label: settingsCopy["settings.snippet_save_1"],
        click: (): void => saveClipboardAsSnippet(1),
      },
      {
        id: "saveSnippet2MenuItem",
        label: settingsCopy["settings.snippet_save_2"],
        click: (): void => saveClipboardAsSnippet(2),
      },
      {
        id: "saveSnippet3MenuItem",
        label: settingsCopy["settings.snippet_save_3"],
        click: (): void => saveClipboardAsSnippet(3),
      },
      {
        id: "saveSignatureMenuItem",
        label: settingsCopy["settings.signature_save"],
        click: (): void => saveClipboardAsSignature(),
      },
      {
        id: "muteToastClipboardMenuItem",
        label: settingsCopy["settings.mute_toast_clipboard"],
        click: (): void => saveClipboardAsMutedToast(),
      },
    ],
  };
}

export function spellAndFilesSubmenu(): MenuItemConstructorOptions {
  return {
    id: "spellFilesMenu",
    label: settingsCopy["settings.section.spell_files"],
    submenu: [
      {
        id: "spellCheckEnabledMenuItem",
        label: settingsCopy["settings.spellcheck"],
        type: "checkbox",
        checked: spellCheckEnabled.value,
        click: (item) => spellCheckEnabled.next(item.checked),
      },
      {
        id: "spellCheckLanguageMenu",
        label: settingsCopy["settings.spell_lang"],
        enabled: spellCheckEnabled.value,
        submenu: SPELLCHECK_LANGS.map((lang) => ({
          id: `spellLang-${lang.code}`,
          label: lang.label,
          type: "radio",
          checked: spellCheckLanguage.value === lang.code,
          click: (): void => spellCheckLanguage.next(lang.code),
        })),
      },
      {
        id: "chooseDownloadsMenuItem",
        label: settingsCopy["settings.downloads"],
        click: (): void => {
          const win = getMainWindow();
          if (win) void chooseDownloadsFolder(win);
        },
      },
    ],
  };
}

export function dataPrivacySubmenu(): MenuItemConstructorOptions {
  return {
    id: "dataPrivacyMenu",
    label: settingsCopy["settings.section.data"],
    submenu: [
      {
        id: "userCssEnabledMenuItem",
        label: settingsCopy["settings.user_css"],
        type: "checkbox",
        checked: userCssEnabled.value,
        click: (item) => userCssEnabled.next(item.checked),
      },
      {
        id: "openUserCssMenuItem",
        label: settingsCopy["settings.user_css_open"],
        click: (): void => openUserCssFile(),
      },
      {
        id: "exportSettingsMenuItem",
        label: settingsCopy["settings.export"],
        click: (): void => {
          const win = getMainWindow();
          if (win) void exportSettingsJson(win);
        },
      },
      {
        id: "importSettingsMenuItem",
        label: settingsCopy["settings.import"],
        click: (): void => {
          const win = getMainWindow();
          if (win) void importSettingsJson(win);
        },
      },
      {
        id: "resetAllSettingsMenuItem",
        label: settingsCopy["settings.reset_all"],
        click: (): void => {
          const win = getMainWindow();
          if (win) void resetAllSettings(win);
        },
      },
      {
        id: "signOutSessionMenuItem",
        label: settingsCopy["settings.sign_out"],
        click: (): void => {
          const win = getMainWindow();
          if (win) void signOutMessagesSession(win);
        },
      },
    ],
  };
}

export function advancedSubmenu(): MenuItemConstructorOptions {
  return {
    id: "advancedMenu",
    label: settingsCopy["settings.section.advanced"],
    submenu: [
      {
        id: "verboseMainLogMenuItem",
        label: settingsCopy["settings.verbose_log"],
        type: "checkbox",
        checked: verboseMainLogEnabled.value,
        click: (item) => verboseMainLogEnabled.next(item.checked),
      },
      {
        id: "openMainLogMenuItem",
        label: settingsCopy["settings.verbose_log_open"],
        click: (): void => openMainLogFile(),
      },
      {
        id: "saveCrashDetailsEnabledMenuItem",
        label: settingsCopy["settings.save_crashes"],
        type: "checkbox",
        checked: saveCrashDetailsEnabled.value,
        click: (item) => saveCrashDetailsEnabled.next(item.checked),
      },
      {
        id: "proxyStatusMenuItem",
        label: proxyStatusLine(process.env),
        enabled: false,
      },
      {
        id: "checkForUpdateOnLaunchMenuItem",
        label: settingsCopy["settings.check_updates_launch"],
        type: "checkbox",
        checked: checkForUpdateOnLaunchEnabled.value,
        click: (item) => checkForUpdateOnLaunchEnabled.next(item.checked),
      },
    ],
  };
}
