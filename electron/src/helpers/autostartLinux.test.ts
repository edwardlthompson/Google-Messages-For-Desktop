import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  LINUX_AUTOSTART_BASENAME,
  linuxAutostartDesktopBody,
  linuxAutostartDir,
  linuxAutostartPaths,
  quoteDesktopExec,
} from "./autostartLinux.ts";

describe("autostartLinux", () => {
  it("quotes exec paths that contain spaces", () => {
    assert.equal(quoteDesktopExec("/usr/bin/GoogleMessages"), "/usr/bin/GoogleMessages");
    assert.equal(
      quoteDesktopExec("/opt/Google Messages/GoogleMessages"),
      '"/opt/Google Messages/GoogleMessages"'
    );
  });

  it("writes an XDG autostart desktop that is enabled immediately", () => {
    const body = linuxAutostartDesktopBody({
      name: "Google Messages",
      execPath: "/opt/Google Messages/GoogleMessages",
    });
    assert.match(body, /^\[Desktop Entry\]/m);
    assert.match(body, /X-GNOME-Autostart-enabled=true/);
    assert.match(body, /Exec="\/opt\/Google Messages\/GoogleMessages"/);
    assert.equal(/Hidden=true/.test(body), false);
  });

  it("targets a stable desktop id under ~/.config/autostart", () => {
    const home = os.homedir();
    assert.equal(linuxAutostartDir(home), path.join(home, ".config", "autostart"));
    const paths = linuxAutostartPaths(home);
    assert.equal(path.basename(paths.target), LINUX_AUTOSTART_BASENAME);
    assert.ok(paths.stale.length >= 1);
  });
});
