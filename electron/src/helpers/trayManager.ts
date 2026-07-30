import {
  app,
  Menu,
  MenuItemConstructorOptions,
  nativeImage,
  Tray,
} from "electron";
import path from "path";
import { trayMenuTemplate } from "../menu/trayMenu";
import {
  INITIAL_ICON_IMAGE,
  IS_DEV,
  IS_MAC,
  IS_WINDOWS,
  RESOURCES_PATH,
  TRAY_AVATAR_SIZE,
  UUID_NAMESPACE,
} from "./constants";
import { settings } from "./settings";
import { v5 as uuidv5 } from "uuid";
import { separator } from "../menu/items/separator";
import { getMainWindow } from "./getMainWindow";

// bring the settings into scoped
const {
  trayEnabled,
  seenMinimizeToTrayWarning,
  monochromeIconEnabled,
  showIconsInRecentConversationTrayEnabled,
  trayIconRedDotEnabled,
} = settings;

export interface Conversation {
  name: string | null | undefined;
  image: string | undefined;
  recentMessage: string | null | undefined;
  i: number;
}

export class TrayManager {
  public enabled = trayEnabled.value;
  private messagesAreUnread = false;
  private recentConversations: Conversation[] = [];

  public tray: Tray | null = null;

  constructor() {
    trayEnabled.subscribe((val) => this.handleTrayEnabledToggle(val));
    monochromeIconEnabled.subscribe(() => {
      const icon = this.getIconImage();
      if (icon) this.tray?.setImage(icon);
    });
    trayIconRedDotEnabled.subscribe(() => {
      const icon = this.getIconImage();
      if (icon) this.tray?.setImage(icon);
    });
  }

  public startIfEnabled(): void {
    if (this.tray || !this.enabled) {
      return;
    }

    const icon = this.getIconImage();
    if (!icon) {
      console.warn("Tray icon missing; not starting tray", this.getIconPath());
      return;
    }

    if (IS_WINDOWS) {
      const guid = uuidv5(
        `${app.getName()}${IS_DEV ? "-development" : ""}-${app.getAppPath()}`,
        UUID_NAMESPACE
      );

      this.tray = new Tray(icon, guid);
    } else {
      this.tray = new Tray(icon);
    }

    const trayContextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    this.tray.setContextMenu(trayContextMenu);
    this.tray.setToolTip("Google Messages");
    this.setupEventListeners();
  }

  /**
   *
   * Set the unread status of the tray
   *
   * @param val value to assugn to messagesAreUnread
   */
  public setUnread(val: boolean): void {
    this.messagesAreUnread = val;
    const icon = this.getIconImage();
    if (icon) {
      this.tray?.setImage(icon);
    }
  }

  public setRecentConversations(data: Conversation[]): void {
    this.recentConversations = data;
    this.refreshTrayMenu();
  }

  public refreshTrayMenu() {
    const conversationMenuItems: MenuItemConstructorOptions[] =
      this.recentConversations.map(({ name, image, recentMessage, i }) => {
        return {
          label: name || "Name not Found",
          sublabel: recentMessage || undefined,
          icon: this.avatarIconFromDataUrl(image),
          click: () => {
            getMainWindow()?.show();
            getMainWindow()?.webContents.send("focus-conversation", i);
          },
        };
      });
    this.tray?.setContextMenu(
      Menu.buildFromTemplate([
        ...conversationMenuItems,
        separator,
        ...trayMenuTemplate,
      ])
    );
  }

  /**
   * Build a tray-menu avatar from a canvas data URL. Invalid / placeholder /
   * empty images are skipped so Electron never logs NativeImage warnings.
   */
  private avatarIconFromDataUrl(image: string | undefined) {
    if (
      image == null ||
      image === INITIAL_ICON_IMAGE ||
      !showIconsInRecentConversationTrayEnabled.value ||
      !image.startsWith("data:image/")
    ) {
      return undefined;
    }
    try {
      const img = nativeImage.createFromDataURL(image);
      if (img.isEmpty()) {
        return undefined;
      }
      return img.resize({
        width: TRAY_AVATAR_SIZE,
        height: TRAY_AVATAR_SIZE,
      });
    } catch {
      return undefined;
    }
  }

  /**
   * Gets the icon path taking into account all possible states and situations.
   */
  private getIconPath(): string {
    let filename: string;
    if (IS_MAC) {
      filename = "icon_macTemplate.png";
    } else {
      const unread =
        this.messagesAreUnread && trayIconRedDotEnabled.value ? "unread_" : "";
      const mono = monochromeIconEnabled.value ? "_mono" : "";
      filename = `${unread}icon${mono}.png`;
    }

    return path.resolve(RESOURCES_PATH, "tray", filename);
  }

  private getIconImage() {
    const img = nativeImage.createFromPath(this.getIconPath());
    return img.isEmpty() ? undefined : img;
  }

  private setupEventListeners() {
    this.tray?.on("click", this.handleTrayClick);
  }

  private destroyEventListeners() {
    this.tray?.removeListener("click", this.handleTrayClick);
    this.tray?.removeListener("double-click", this.handleTrayClick);
  }

  private handleTrayClick() {
    const mainWindow = getMainWindow();
    if (!mainWindow) return;

    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  }

  private destroy(): void {
    this.destroyEventListeners();
    this.tray?.destroy();
    this.tray = null;
  }

  public showMinimizeToTrayWarning(): void {
    if (IS_WINDOWS && trayEnabled.value) {
      if (!seenMinimizeToTrayWarning.value && this.tray != null) {
        this.tray.displayBalloon({
          title: "Google Messages",
          content:
            "Google Messages is still running in the background. To close it, use the File menu or right-click on the tray icon.",
        });
        seenMinimizeToTrayWarning.next(true);
      }
    }
  }

  public handleTrayEnabledToggle(newValue: boolean): void {
    this.enabled = newValue;
    const menuItemIds = [
      "startInTrayMenuItem",
      "monochromeIconEnabledMenuItem",
      "showIconsInRecentConversationTrayEnabledMenuItem",
      "trayIconRedDotEnabledMenuItem",
    ];

    if (newValue) {
      this.startIfEnabled();
      this.refreshTrayMenu();
    } else {
      this.destroy();
      const mainWindow = getMainWindow();
      if (!mainWindow?.isVisible()) {
        mainWindow?.show();
      }
    }

    for (const id of menuItemIds) {
      const item = Menu.getApplicationMenu()?.getMenuItemById(id);
      if (item != null) {
        item.enabled = newValue;
      }
    }
  }
}
