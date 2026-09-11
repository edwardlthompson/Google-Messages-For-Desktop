"""Waiting-on-a-person HUMAN automations for this Electron child."""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

LIB = Path(__file__).resolve().parent.parent / "scripts" / "lib"
if str(LIB) not in sys.path:
    sys.path.insert(0, str(LIB))

from github_default_branch import default_branch  # noqa: E402
from human_task_automation import HUMAN_RULES  # noqa: E402
from human_task_gmfd_waiting import (  # noqa: E402
    automate_f009_signing,
    automate_sacred_examples_skip,
    check_scorecard_local,
    check_waiting_local,
)

ROOT = Path(__file__).resolve().parent.parent

ROWS = (
    "F-009 Wire auto-update publish + signing before enabling launch checks",
    "Sacred: review `examples/node` from parent 1.4.0 — never blind-overwrite Electron (item 18)",
    "Sacred: review `examples/python` from parent 1.4.0 — do not vendor (item 19)",
    "Sacred: review `examples/web` from parent 1.4.0 — do not vendor (item 20)",
    "Enable OpenSSF Scorecard workflow + align GitHub branch-protection check names with default branch `master`",
)


class GmfdHumanWaitingTests(unittest.TestCase):
    def test_rules_match(self) -> None:
        for task in ROWS:
            hit = any(pattern.search(task) for pattern, _kind, _fn in HUMAN_RULES)
            self.assertTrue(hit, task)

    def test_local_handlers_pass_here(self) -> None:
        self.assertEqual(automate_f009_signing(ROOT, {}).exit_code, 0)
        self.assertEqual(automate_sacred_examples_skip(ROOT, {}).exit_code, 0)
        self.assertEqual(check_scorecard_local(ROOT).exit_code, 0)
        self.assertEqual(default_branch(ROOT), "master")
        self.assertEqual(check_waiting_local(ROOT), 0)

    def test_sacred_fails_if_examples_present(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "electron").mkdir()
            (root / "electron" / "package.json").write_text("{}", encoding="utf-8")
            (root / "examples" / "node").mkdir(parents=True)
            result = automate_sacred_examples_skip(root, {})
            self.assertEqual(result.exit_code, 1)
            self.assertTrue(result.backlog)

    def test_f009_requires_launch_default_off(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            wf = root / ".github" / "workflows"
            wf.mkdir(parents=True)
            wf.joinpath("release-desktop.yml").write_text("CSC_LINK: x\n", encoding="utf-8")
            settings = root / "electron" / "src" / "helpers"
            settings.mkdir(parents=True)
            settings.joinpath("settings.ts").write_text(
                "checkForUpdateOnLaunchEnabled: true,\n", encoding="utf-8"
            )
            result = automate_f009_signing(root, {})
            self.assertEqual(result.exit_code, 1)

    def test_scorecard_rejects_template_only_required_checks(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            wf = root / ".github" / "workflows"
            wf.mkdir(parents=True)
            wf.joinpath("scorecard.yml").write_text("on:\n  push:\n    branches: [master]\n", encoding="utf-8")
            (root / "README.md").write_text("https://securityscorecards.dev/x\n", encoding="utf-8")
            github = root / ".github"
            github.mkdir(parents=True, exist_ok=True)
            github.joinpath("settings.yml").write_text(
                "repository:\n  default_branch: master\nbranches:\n  - name: master\n",
                encoding="utf-8",
            )
            github.joinpath("required-checks.json").write_text(
                json.dumps(
                    {
                        "required_status_checks": ["CI", "Security Scan", "CodeQL", "Repo Hygiene"],
                        "informational_status_checks": ["OpenSSF Scorecard"],
                    }
                ),
                encoding="utf-8",
            )
            result = check_scorecard_local(root)
            self.assertEqual(result.exit_code, 1)


if __name__ == "__main__":
    unittest.main()
