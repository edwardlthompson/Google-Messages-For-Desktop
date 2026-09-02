"""GMFD HUMAN BUILD_PLAN rows must match automation rules."""
from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

LIB = Path(__file__).resolve().parent.parent / "scripts" / "lib"
if str(LIB) not in sys.path:
    sys.path.insert(0, str(LIB))

from human_task_automation import HUMAN_RULES  # noqa: E402
from human_task_gmfd import (  # noqa: E402
    automate_deferred_workflows,
    automate_engines_node,
    automate_product_fit_skim,
    automate_sign_pipeline,
)
from human_task_gmfd_github import automate_release_screenshots  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

TASKS = (
    "Sign/notarize desktop artifacts (replace unsigned Release assets for production)",
    "Device smoke: first-run Defaults → Sign in → Verify; `tel:`/`sms:` compose",
    "Smoke: Windows toast + tray unread red-dot",
    "Smoke v1.9.0: first launch has no donate popup",
    "Optional local `npm run release:windows` for signed Windows builds",
    "GitHub Releases when packaging updates are needed (Electron via Actions or local)",
    "Skim `AGENTS.md` + `BUILD_PLAN.md` for product-fit",
    "Optional: configure branch protection required checks for CI / CodeQL",
    "Keep deferred workflows deferred unless explicitly requested",
    "Optional: bump `engines.node` after packaging smoke",
    "Optional Codex CLI smoke (`/codex-review`) if `OPENAI_API_KEY` is available locally",
    "Manual merge of `docs/INITIALIZATION_PROMPT.md` vs upstream (never blind overwrite)",
    "Confirm `.github/FUNDING.yml` and GitHub About blurb (`docs/GITHUB_ABOUT.md`)",
    "Enable GitHub Issues + bug/feature templates",
    "Enable GitHub Discussions for ideas",
    "Release screenshot set (first-run, tray, update dialog)",
)


class HumanTaskGmfdTests(unittest.TestCase):
    def test_every_child_human_row_matches(self) -> None:
        for task in TASKS:
            hit = any(pattern.search(task) for pattern, _kind, _fn in HUMAN_RULES)
            self.assertTrue(hit, task)

    def test_local_handlers_pass_on_this_repo(self) -> None:
        self.assertEqual(automate_sign_pipeline(ROOT, {}).exit_code, 0)
        self.assertEqual(automate_deferred_workflows(ROOT, {}).exit_code, 0)
        self.assertEqual(automate_product_fit_skim(ROOT, {}).exit_code, 0)

    def test_screenshots_and_engines_in_temp(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            icons = root / "electron" / "resources" / "icons"
            icons.mkdir(parents=True)
            (icons / "256x256.png").write_bytes(b"\x89PNG")
            self.assertEqual(automate_release_screenshots(root, {}).exit_code, 0)
            self.assertTrue((root / "docs" / "release-screenshots" / "tray.png").is_file())
            (root / "package.json").write_text('{"engines": {"node": ">=18.0.0"}}\n', encoding="utf-8")
            self.assertEqual(automate_engines_node(root, {}).exit_code, 0)
            self.assertIn(">=20", (root / "package.json").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
