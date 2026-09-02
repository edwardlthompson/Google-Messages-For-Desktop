import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setActiveLanguage } from "./i18n.ts";
import { settingsCopy } from "./settingsCopy.ts";

describe("settingsCopy", () => {
  it("keys appearance and crash-save strings under settings.*", () => {
    setActiveLanguage("en");
    assert.equal(settingsCopy["settings.theme"], "Appearance");
    assert.equal(settingsCopy["settings.theme.dark"], "Dark");
    assert.match(settingsCopy["settings.save_crashes"], /crash details/i);
    assert.match(settingsCopy["settings.check_updates_launch"], /launch/i);
    assert.match(settingsCopy["settings.start_with_os"], /operating system/i);
    assert.match(settingsCopy["settings.notify_sound"], /sound/i);
    assert.match(settingsCopy["settings.quiet_hours"], /Quiet hours/i);
    assert.match(settingsCopy["settings.always_on_top"], /Always on top/i);
    assert.match(settingsCopy["settings.user_css"], /user\.css/i);
    assert.match(settingsCopy["settings.verbose_log"], /main\.log/i);
    assert.match(settingsCopy["settings.title"], /Settings/);
  });
});
