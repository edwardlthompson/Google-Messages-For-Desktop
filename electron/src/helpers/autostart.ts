import { app } from "electron";
import { settings } from "./settings";

export function bindAutostart(): void {
  const apply = (): void => {
    app.setLoginItemSettings({
      openAtLogin: settings.startWithOsEnabled.value,
      openAsHidden: settings.startInTrayEnabled.value,
    });
  };
  apply();
  settings.startWithOsEnabled.subscribe(apply);
  settings.startInTrayEnabled.subscribe(apply);
}
