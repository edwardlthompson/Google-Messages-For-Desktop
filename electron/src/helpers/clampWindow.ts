export type Rect = { x: number; y: number; width: number; height: number };

/** If the saved origin is off the work area, return null so the window can center. */
export function clampWindowPosition(
  pos: { x: number; y: number } | null,
  size: { width: number; height: number },
  workArea: Rect | null
): { x: number; y: number } | null {
  if (pos == null || workArea == null) return pos;
  const margin = 48;
  const right = pos.x + Math.min(size.width, 80);
  const bottom = pos.y + Math.min(size.height, 80);
  const visible =
    right > workArea.x + margin &&
    bottom > workArea.y + margin &&
    pos.x < workArea.x + workArea.width - margin &&
    pos.y < workArea.y + workArea.height - margin;
  return visible ? pos : null;
}
