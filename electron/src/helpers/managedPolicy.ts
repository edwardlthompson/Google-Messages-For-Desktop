/** Managed kiosk/policy overlay (no Electron). */

export type ManagedPolicy = {
  autostart?: boolean;
  tray?: boolean;
  updatesOff?: boolean;
};

export function parseManagedPolicy(raw: unknown): ManagedPolicy {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const rec = raw as Record<string, unknown>;
  const out: ManagedPolicy = {};
  if (typeof rec.autostart === "boolean") out.autostart = rec.autostart;
  if (typeof rec.tray === "boolean") out.tray = rec.tray;
  if (typeof rec.updatesOff === "boolean") out.updatesOff = rec.updatesOff;
  return out;
}

export function policyDisablesUpdates(policy: ManagedPolicy): boolean {
  return policy.updatesOff === true;
}
