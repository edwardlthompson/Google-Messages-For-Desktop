import fs from "fs";
import path from "path";
import { app } from "electron";
import { parseManagedPolicy, type ManagedPolicy } from "./managedPolicy";
import { settings } from "./settings";

let cached: ManagedPolicy = {};

export function getManagedPolicy(): ManagedPolicy {
  return cached;
}

export function loadManagedPolicy(): ManagedPolicy {
  const fromEnv = process.env.GMFD_POLICY_FILE?.trim();
  const candidates = [
    fromEnv,
    path.resolve(app.getPath("userData"), "managed-policy.json"),
  ].filter((p): p is string => Boolean(p));
  for (const dest of candidates) {
    try {
      const raw = JSON.parse(fs.readFileSync(dest, "utf8"));
      cached = parseManagedPolicy(raw);
      applyManagedPolicy(cached);
      return cached;
    } catch {
      /* missing or invalid */
    }
  }
  cached = {};
  return cached;
}

export function applyManagedPolicy(policy: ManagedPolicy): void {
  if (policy.autostart === false) settings.startWithOsEnabled.next(false);
  if (policy.tray === false) settings.trayEnabled.next(false);
  if (policy.updatesOff === true) settings.checkForUpdateOnLaunchEnabled.next(false);
}
