import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SETTINGS_NESTED_IDS,
  SETTINGS_TOP_LEVEL_IDS,
  settingsTopLevelInteractiveCount,
  settingsTopLevelRowCount,
} from "./settingsMenuStructure.ts";

const here = path.dirname(fileURLToPath(import.meta.url));

describe("settingsMenuStructure", () => {
  it("keeps the Settings top level short for laptop menus", () => {
    assert.ok(settingsTopLevelRowCount() <= 14);
    assert.ok(settingsTopLevelInteractiveCount() <= 12);
    assert.equal(
      SETTINGS_TOP_LEVEL_IDS.filter((id) => id == null).length,
      2,
      "exactly two separators at top level"
    );
  });

  it("nests tray enable under trayIconMenu", () => {
    assert.ok(
      SETTINGS_NESTED_IDS.trayIconMenu.includes("enableTrayIconMenuItem")
    );
  });

  it("declares required section menus with expected child IDs", () => {
    for (const [sectionId, children] of Object.entries(SETTINGS_NESTED_IDS)) {
      assert.ok(children.length > 0, `${sectionId} must have children`);
      assert.ok(
        SETTINGS_TOP_LEVEL_IDS.includes(sectionId),
        `${sectionId} must appear at top level`
      );
    }
    assert.deepEqual(
      [...SETTINGS_NESTED_IDS.notificationsMenu],
      [
        "hideNotificationContentMenuItem",
        "notificationSoundEnabledMenuItem",
        "quietHoursMenu",
        "taskbarFlashEnabledMenuItem",
      ]
    );
  });

  it("builders in settingsMenuSections.ts still declare nested IDs", () => {
    const src = fs.readFileSync(
      path.join(here, "settingsMenuSections.ts"),
      "utf8"
    );
    for (const [sectionId, children] of Object.entries(SETTINGS_NESTED_IDS)) {
      assert.match(src, new RegExp(`id:\\s*"${sectionId}"`));
      for (const childId of children) {
        assert.match(
          src,
          new RegExp(`id:\\s*"${childId}"`),
          `${childId} missing from settingsMenuSections.ts`
        );
      }
    }
  });

  it("settingsMenu.ts composes section builders and top-level IDs", () => {
    const src = fs.readFileSync(path.join(here, "settingsMenu.ts"), "utf8");
    assert.match(src, /trayIconSubmenu\(\)/);
    assert.match(src, /notificationsSubmenu\(\)/);
    assert.match(src, /windowStartupSubmenu\(\)/);
    assert.match(src, /messagingSubmenu\(\)/);
    assert.match(src, /spellAndFilesSubmenu\(\)/);
    assert.match(src, /dataPrivacySubmenu\(\)/);
    assert.match(src, /advancedSubmenu\(\)/);
    assert.match(src, /id:\s*"defaultMessagingAppsMenuItem"/);
    assert.match(src, /id:\s*"openWindowsDefaultAppsMenuItem"/);
    assert.doesNotMatch(src, /settingsDataItems/);
  });
});
