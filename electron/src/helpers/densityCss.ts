export const DENSITY_PRESETS = ["default", "comfortable", "compact"] as const;
export type DensityPreset = (typeof DENSITY_PRESETS)[number];

export function parseDensityPreset(raw: unknown): DensityPreset {
  if (raw === "comfortable" || raw === "compact" || raw === "default") return raw;
  return "default";
}

export function densityCssFilename(preset: DensityPreset): string | null {
  if (preset === "comfortable") return "comfortable.css";
  if (preset === "compact") return "compact.css";
  return null;
}
