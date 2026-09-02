export const MAX_FIND_QUERY = 200;

export function clampFindQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.slice(0, MAX_FIND_QUERY);
}
