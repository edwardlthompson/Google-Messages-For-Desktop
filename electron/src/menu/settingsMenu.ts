import {
  BaseWindow,
  BrowserWindow,
  MenuItemConstructorOptions,
} from "electron";
import { IS_MAC, IS_WINDOWS } from "../helpers/constants";
import {
  openOsDefaultAppsSettings,
  showOnboardingAgain,
} from "../helpers/onboarding";
import { settingsCopy } from "../helpers/settingsCopy";
import { settings } from "../helpers/settings";
import { profileMenuItems } from "../helpers/sessionProfileUi";
import { separator } from "./items/separator";
import {
  advancedSubmenu,
  dataPrivacySubmenu,
  messagingSubmenu,
  notificationsSubmenu,
  spellAndFilesSubmenu,
  trayIconSubmenu,
  windowStartupSubmenu,
} from "./settingsMenuSections";

const { themePreference, densityPreset } = settings;

export function settingsMenu(): MenuItemConstructorOptions {
  return {
    label: IS_MAC
      ? settingsCopy["settings.title_mac"]
      : settingsCopy["settings.title"],
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
      trayIconSubmenu(),
      notificationsSubmenu(),
      windowStartupSubmenu(),
      messagingSubmenu(),
      spellAndFilesSubmenu(),
      dataPrivacySubmenu(),
      advancedSubmenu(),
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
