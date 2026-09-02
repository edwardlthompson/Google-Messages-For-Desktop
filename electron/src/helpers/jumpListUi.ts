import path from "path";
import {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
} from "electron";
import { IS_MAC, IS_WINDOWS, RESOURCES_PATH } from "./constants";
import { getMainWindow } from "./getMainWindow";
import { handleProtocolUrl } from "./protocols";
import {
  jumpListRecentItems,
  NEW_MESSAGE_ARG,
  parsePhoneList,
} from "./jumpList";
import { settings } from "./settings";

function newMessage(): void {
  const win = getMainWindow();
  if (win) void handleProtocolUrl(win, "im:");
}

export function bindOsChromeTasks(win: BrowserWindow): void {
  const icon = nativeImage.createFromPath(
    path.resolve(RESOURCES_PATH, "icons", "256x256.png")
  );
  const apply = (): void => {
    const hide = settings.hideNotificationContentEnabled.value;
    const recent = jumpListRecentItems(settings.lastProtocolNumbers.value, hide);
    if (IS_WINDOWS && !win.isDestroyed()) {
      app.setJumpList([
        {
          type: "tasks",
          items: [
            {
              type: "task",
              title: "New message",
              program: process.execPath,
              args: NEW_MESSAGE_ARG,
              iconPath: process.execPath,
              iconIndex: 0,
            },
            ...recent.map((item) => ({
              type: "task" as const,
              title: item.title,
              program: process.execPath,
              args: item.args,
              iconPath: process.execPath,
              iconIndex: 0,
            })),
          ],
        },
      ]);
      win.setThumbarButtons([
        {
          tooltip: "New message",
          icon: icon.isEmpty() ? nativeImage.createEmpty() : icon.resize({ width: 16, height: 16 }),
          click: () => newMessage(),
        },
      ]);
    }
    if (IS_MAC && app.dock) {
      app.dock.setMenu(
        Menu.buildFromTemplate([
          { label: "New message", click: () => newMessage() },
        ])
      );
    }
  };
  apply();
  settings.lastProtocolNumbers.subscribe(apply);
  settings.hideNotificationContentEnabled.subscribe(apply);
}

export { parsePhoneList };
