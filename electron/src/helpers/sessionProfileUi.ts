import { app, session, type MenuItemConstructorOptions } from "electron";
import { parseProfileId, PROFILE_IDS, sessionPartitionForProfile, isEphemeralProfile, GUEST_PARTITION } from "./sessionProfile";
import { settings } from "./settings";
import { settingsCopy } from "./settingsCopy";

export function switchProfile(raw: unknown): void {
  const next = parseProfileId(raw);
  if (parseProfileId(settings.activeProfileId.value) === next) return;
  settings.activeProfileId.next(next);
  app.relaunch();
  app.quit();
}

export function profileMenuItems(): MenuItemConstructorOptions[] {
  const current = parseProfileId(settings.activeProfileId.value);
  const labels: Record<typeof PROFILE_IDS[number], string> = {
    main: settingsCopy["settings.profile.main"],
    work: settingsCopy["settings.profile.work"],
    personal: settingsCopy["settings.profile.personal"],
    guest: settingsCopy["settings.profile.guest"],
  };
  return PROFILE_IDS.map((id) => ({
    id: `profile-${id}`,
    label: labels[id],
    type: "radio" as const,
    checked: current === id,
    click: (): void => switchProfile(id),
  }));
}

export function bindGuestSessionWipe(): void {
  app.on("will-quit", () => {
    if (!isEphemeralProfile(settings.activeProfileId.value)) return;
    void session.fromPartition(GUEST_PARTITION).clearStorageData();
  });
}

export function currentSessionPartition(): string {
  return sessionPartitionForProfile(settings.activeProfileId.value);
}
