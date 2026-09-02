import { clipboard, ContextMenuParams, Menu, MenuItemConstructorOptions, shell } from "electron";
import { getMainWindow } from "../helpers/getMainWindow";
import { menuCopy } from "../helpers/menuCopy";
import { allowContextLink } from "../helpers/navigationAllowlist";
import { separator } from "./items/separator";

function standardMenuTemplate(): MenuItemConstructorOptions[] {
  return [
    {
      label: menuCopy["menu.copy"],
      role: "copy",
    },
    separator,
    {
      label: menuCopy["menu.select_all"],
      role: "selectAll",
    },
  ];
}

function textMenuTemplate(): MenuItemConstructorOptions[] {
  return [
    {
      label: menuCopy["menu.undo"],
      role: "undo",
    },
    {
      label: menuCopy["menu.redo"],
      role: "redo",
    },
    separator,
    {
      label: menuCopy["menu.cut"],
      role: "cut",
    },
    {
      label: menuCopy["menu.copy"],
      role: "copy",
    },
    {
      label: menuCopy["menu.paste"],
      role: "paste",
    },
    separator,
    {
      label: menuCopy["menu.select_all"],
      role: "selectAll",
    },
  ];
}

export const popupContextMenu = (
  _event: Electron.Event,
  params: ContextMenuParams
) => {
  let menu: Menu;
  if (params.mediaType === "none" && params.isEditable) {
    const textMenuTemplateCopy = textMenuTemplate();
    if (params.misspelledWord) {
      textMenuTemplateCopy.unshift(
        { type: "separator" },
        {
          label: menuCopy["menu.add_dictionary"],
          click: () =>
            getMainWindow()?.webContents.session.addWordToSpellCheckerDictionary(
              params.misspelledWord
            ),
        },
        { type: "separator" }
      );
      for (const suggestion of params.dictionarySuggestions.reverse()) {
        textMenuTemplateCopy.unshift({
          label: suggestion,
          click: () =>
            getMainWindow()?.webContents.replaceMisspelling(suggestion),
        });
      }
    }
    menu = Menu.buildFromTemplate(textMenuTemplateCopy);
  } else {
    const items = standardMenuTemplate();
    const link = params.linkURL;
    if (link && allowContextLink(link)) {
      items.unshift(
        {
          label: menuCopy["menu.open_link"],
          click: () => void shell.openExternal(link),
        },
        {
          label: menuCopy["menu.copy_link"],
          click: () => clipboard.writeText(link),
        },
        separator
      );
    }
    menu = Menu.buildFromTemplate(items);
  }

  menu?.popup();
};
