export function ebusyHint(stderr: string): string | null {
  if (!/EBUSY|resource busy or locked|unable to access/i.test(stderr)) return null;
  return "Close Google Messages (including electron/dist/win-unpacked/GoogleMessages.exe) and retry package:win.";
}
