import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import {
  notificationSoundCommands,
  resolvePlayableSoundPath,
} from "./notifySound.ts";

describe("notifySound", () => {
  it("rewrites asar paths so OS players can open the wav", () => {
    const packed = path.join("foo", "app.asar", "resources");
    const out = resolvePlayableSoundPath(packed);
    assert.match(out, /app\.asar\.unpacked/);
    assert.match(out, /notify-chime\.wav$/);
  });

  it("uses paplay then pipewire on linux", () => {
    const cmds = notificationSoundCommands("linux", "/tmp/notify-chime.wav");
    assert.equal(cmds[0]?.[0], "paplay");
    assert.equal(cmds[1]?.[0], "pw-play");
  });

  it("uses afplay on macOS and powershell on Windows", () => {
    assert.equal(
      notificationSoundCommands("darwin", "/tmp/n.wav")[0]?.[0],
      "afplay"
    );
    assert.equal(
      notificationSoundCommands("win32", "C:\\\\n.wav")[0]?.[0],
      "powershell.exe"
    );
  });
});
