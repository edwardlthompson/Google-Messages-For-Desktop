export function shouldFlashTaskbar(
  flashEnabled: boolean,
  reduceMotion: boolean
): boolean {
  return flashEnabled && !reduceMotion;
}
