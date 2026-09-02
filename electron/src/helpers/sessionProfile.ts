/** Named Chromium partitions. Default stays persist:main for Google auth. */

export const PROFILE_IDS = ["main", "work", "personal", "guest"] as const;
export type ProfileId = (typeof PROFILE_IDS)[number];

export const MAIN_PARTITION = "persist:main";
export const GUEST_PARTITION = "guest";

export function parseProfileId(raw: unknown): ProfileId {
  if (raw === "work" || raw === "personal" || raw === "guest") return raw;
  return "main";
}

export function sessionPartitionForProfile(raw: unknown): string {
  const id = parseProfileId(raw);
  if (id === "main") return MAIN_PARTITION;
  if (id === "guest") return GUEST_PARTITION;
  return `persist:profile-${id}`;
}

export function isEphemeralProfile(raw: unknown): boolean {
  return parseProfileId(raw) === "guest";
}
