import { MenuItemConstructorOptions } from "electron";
import { getMainWindow } from "../helpers/getMainWindow";
import {
  exportSettingsJson,
  importSettingsJson,
  openUserCssFile,
  resetAllSettings,
  signOutMessagesSession,
} from "../helpers/settingsIoUi";
import { openMainLogFile } from "../helpers/verboseLogUi";
import { chooseDownloadsFolder } from "../helpers/downloadsUi";
import { chooseCustomTrayIcon, clearCustomTrayIcon } from "../helpers/customTrayIconUi";
import {
  copySnippet,
  saveClipboardAsMutedToast,
  saveClipboardAsSignature,
  saveClipboardAsSnippet,
} from "../helpers/composeExtrasUi";
import { SPELLCHECK_LANGS } from "../helpers/spellcheckLang";
import { settings } from "../helpers/settings";
import { settingsCopy } from "../helpers/settingsCopy";
import { separator } from "./items/separator";

const { userCssEnabled, spellCheckLanguage, spellCheckEnabled, verboseMainLogEnabled } =
  settings;

export function settingsDataItems(): MenuItemConstructorOptions[] {
  return [
    {
      id: "userCssEnabledMenuItem",
      label: settingsCopy["settings.user_css"],
      type: "checkbox",
      checked: userCssEnabled.value,
      click: (item) => userCssEnabled.next(item.checked),
    },
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
      id: "openUserCssMenuItem",
      label: settingsCopy["settings.user_css_open"],
      click: (): void => openUserCssFile(),
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
    separator,
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
  ];
}
