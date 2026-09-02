import {
  BaseWindow,
  BrowserWindow,
  MenuItem,
  MenuItemConstructorOptions,
} from "electron";
import { IS_MAC, IS_WINDOWS } from "../helpers/constants";
import {
  openOsDefaultAppsSettings,
  showOnboardingAgain,
} from "../helpers/onboarding";
import { settingsCopy } from "../helpers/settingsCopy";
import { settings } from "../helpers/settings";
import { getMainWindow } from "../helpers/getMainWindow";
import { resetWindowSizeAndPosition } from "../helpers/windowPrefsUi";
import { profileMenuItems } from "../helpers/sessionProfileUi";
import { proxyStatusLine } from "../helpers/proxyStatus";
import { separator } from "./items/separator";
import { settingsDataItems } from "./settingsDataItems";

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
  saveCrashDetailsEnabled,
  themePreference,
  checkForUpdateOnLaunchEnabled,
  startWithOsEnabled,
  quietHoursEnabled,
  quietHoursPreset,
  notificationSoundEnabled,
  alwaysOnTopEnabled,
  reduceMotionEnabled,
  closeActionPreference,
  hardwareAccelerationEnabled,
  densityPreset,
  unreadBadgeColor,
  windowsMicaEnabled,
  wrapperMuteHotkeyEnabled,
  confirmProtocolCompose,
} = settings;

export function settingsMenu(): MenuItemConstructorOptions {
  return {
  label: IS_MAC ? settingsCopy["settings.title_mac"] : settingsCopy["settings.title"],
  submenu: [
    {
      id: "themePreferenceMenu",
      label: settingsCopy["settings.theme"],
      submenu: [
        {
          id: "themeSystemMenuItem",
          label: settingsCopy["settings.theme.system"],
          type: "radio",
          checked: themePreference.value === "system",
          click: (): void => themePreference.next("system"),
        },
        {
          id: "themeLightMenuItem",
          label: settingsCopy["settings.theme.light"],
          type: "radio",
          checked: themePreference.value === "light",
          click: (): void => themePreference.next("light"),
        },
        {
          id: "themeDarkMenuItem",
          label: settingsCopy["settings.theme.dark"],
          type: "radio",
          checked: themePreference.value === "dark",
          click: (): void => themePreference.next("dark"),
        },
      ],
    },
    {
      id: "densityPresetMenu",
      label: settingsCopy["settings.density"],
      submenu: [
        {
          id: "densityDefaultMenuItem",
          label: settingsCopy["settings.density.default"],
          type: "radio",
          checked: densityPreset.value === "default",
          click: (): void => densityPreset.next("default"),
        },
        {
          id: "densityComfortableMenuItem",
          label: settingsCopy["settings.density.comfortable"],
          type: "radio",
          checked: densityPreset.value === "comfortable",
          click: (): void => densityPreset.next("comfortable"),
        },
        {
          id: "densityCompactMenuItem",
          label: settingsCopy["settings.density.compact"],
          type: "radio",
          checked: densityPreset.value === "compact",
          click: (): void => densityPreset.next("compact"),
        },
      ],
    },
    {
      id: "profileMenu",
      label: settingsCopy["settings.profile"],
      submenu: profileMenuItems(),
    },
    separator,
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
      ...separator,
      visible: !IS_MAC,
    },
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
    separator,
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
          checked: quietHoursEnabled.value && quietHoursPreset.value === "22-07",
          click: (): void => {
            quietHoursEnabled.next(true);
            quietHoursPreset.next("22-07");
          },
        },
        {
          id: "quietHours2108MenuItem",
          label: settingsCopy["settings.quiet_hours.21_08"],
          type: "radio",
          checked: quietHoursEnabled.value && quietHoursPreset.value === "21-08",
          click: (): void => {
            quietHoursEnabled.next(true);
            quietHoursPreset.next("21-08");
          },
        },
        {
          id: "quietHours2306MenuItem",
          label: settingsCopy["settings.quiet_hours.23_06"],
          type: "radio",
          checked: quietHoursEnabled.value && quietHoursPreset.value === "23-06",
          click: (): void => {
            quietHoursEnabled.next(true);
            quietHoursPreset.next("23-06");
          },
        },
      ],
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
    {
      id: "confirmProtocolComposeMenuItem",
      label: settingsCopy["settings.confirm_protocol"],
      type: "checkbox",
      checked: confirmProtocolCompose.value,
      click: (item) => confirmProtocolCompose.next(item.checked),
    },
    {
      id: "proxyStatusMenuItem",
      label: proxyStatusLine(process.env),
      enabled: false,
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
      id: "taskbarFlashEnabledMenuItem",
      label: settingsCopy["settings.taskbar_flash"],
      type: "checkbox",
      checked: taskbarFlashEnabled.value,
      click: (item) => taskbarFlashEnabled.next(item.checked),
    },
    {
      id: "spellCheckEnabledMenuItem",
      label: settingsCopy["settings.spellcheck"],
      type: "checkbox",
      checked: spellCheckEnabled.value,
      click: (item) => spellCheckEnabled.next(item.checked),
    },
    {
      id: "saveCrashDetailsEnabledMenuItem",
      label: settingsCopy["settings.save_crashes"],
      type: "checkbox",
      checked: saveCrashDetailsEnabled.value,
      click: (item) => saveCrashDetailsEnabled.next(item.checked),
    },
    {
      id: "checkForUpdateOnLaunchMenuItem",
      label: settingsCopy["settings.check_updates_launch"],
      type: "checkbox",
      checked: checkForUpdateOnLaunchEnabled.value,
      click: (item) => checkForUpdateOnLaunchEnabled.next(item.checked),
    },
    {
      id: "startWithOsEnabledMenuItem",
      label: settingsCopy["settings.start_with_os"],
      type: "checkbox",
      checked: startWithOsEnabled.value,
      click: (item) => startWithOsEnabled.next(item.checked),
    },
    separator,
    ...settingsDataItems(),
    separator,
    {
      id: "defaultMessagingAppsMenuItem",
      label: settingsCopy["settings.default_app"],
      click: (_item, window?: BaseWindow): void => {
        const win =
          (window as BrowserWindow | undefined) ||
          BrowserWindow.getFocusedWindow() ||
          BrowserWindow.getAllWindows()[0];
        if (win) showOnboardingAgain(win);
        else openOsDefaultAppsSettings();
      },
    },
    {
      id: "openWindowsDefaultAppsMenuItem",
      label: IS_WINDOWS
        ? settingsCopy["settings.os_defaults_win"]
        : settingsCopy["settings.os_defaults"],
      click: (): void => openOsDefaultAppsSettings(),
    },
  ],
  };
}
