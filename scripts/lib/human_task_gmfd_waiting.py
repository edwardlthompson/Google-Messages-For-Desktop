"""Automate remaining GMFD Waiting-on-a-person HUMAN rows."""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

from github_default_branch import default_branch
from human_task_core import AttemptResult
from human_task_github import automate_branch_protection
from human_task_leftovers import SCORECARD_NEEDLES
from required_checks import load_informational, load_names

SACRED_STACKS = ("node", "python", "web")
LAUNCH_DEFAULT = re.compile(r"checkForUpdateOnLaunchEnabled:\s*false\b")
TEMPLATE_ONLY = ("Repo Hygiene", "Feature Gate", "Template Upgrade Simulation")
MERGE_CHECKS = ("CI", "Security Scan", "CodeQL")


def automate_f009_signing(root: Path, _cfg: dict) -> AttemptResult:
    wf = root / ".github" / "workflows" / "release-desktop.yml"
    if not wf.is_file():
        return AttemptResult(1, "f009-signing", "release-desktop.yml missing", True)
    if "CSC_LINK" not in wf.read_text(encoding="utf-8"):
        return AttemptResult(1, "f009-signing", "release-desktop.yml missing CSC_LINK wiring", True)
    settings = root / "electron" / "src" / "helpers" / "settings.ts"
    if not settings.is_file():
        return AttemptResult(1, "f009-signing", "electron settings.ts missing", True)
    if not LAUNCH_DEFAULT.search(settings.read_text(encoding="utf-8")):
        return AttemptResult(
            1,
            "f009-signing",
            "checkForUpdateOnLaunchEnabled must default false until signed releases",
            True,
        )
    return AttemptResult(
        0,
        "f009-signing",
        "release-desktop.yml honors CSC_LINK; launch update checks stay off by default",
        False,
    )


def automate_sacred_examples_skip(root: Path, _cfg: dict) -> AttemptResult:
    if not (root / "electron" / "package.json").is_file():
        return AttemptResult(1, "sacred-examples", "electron/package.json missing", True)
    present = [name for name in SACRED_STACKS if (root / "examples" / name).is_dir()]
    if present:
        return AttemptResult(
            1,
            "sacred-examples",
            f"do not vendor parent examples/; found {', '.join(present)}",
            True,
        )
    return AttemptResult(
        0,
        "sacred-examples",
        "examples/{node,python,web} stay absent; node product is electron/",
        False,
    )


def check_scorecard_local(root: Path, _cfg: dict | None = None) -> AttemptResult:
    wf = root / ".github" / "workflows" / "scorecard.yml"
    if not wf.is_file():
        return AttemptResult(1, "scorecard-master", "scorecard.yml missing", True)
    branch = default_branch(root)
    compact = re.sub(r"\s+", "", wf.read_text(encoding="utf-8"))
    if f"branches:[{branch}]" not in compact:
        return AttemptResult(1, "scorecard-master", f"scorecard.yml must push on {branch}", True)
    readme = (root / "README.md").read_text(encoding="utf-8")
    if not any(needle in readme for needle in SCORECARD_NEEDLES):
        return AttemptResult(1, "scorecard-master", "README missing OpenSSF Scorecard badge", True)
    settings = root / ".github" / "settings.yml"
    if not settings.is_file() or f"- name: {branch}" not in settings.read_text(encoding="utf-8"):
        return AttemptResult(1, "scorecard-master", f"settings.yml must protect {branch}", True)
    try:
        names = load_names(root)
        info = load_informational(root)
    except (OSError, ValueError) as exc:
        return AttemptResult(1, "scorecard-master", str(exc), True)
    missing = [name for name in MERGE_CHECKS if name not in names]
    if missing:
        return AttemptResult(1, "scorecard-master", f"required-checks missing {missing}", True)
    banned = [name for name in names if any(part in name for part in TEMPLATE_ONLY)]
    if banned:
        return AttemptResult(1, "scorecard-master", f"do not require template-only checks {banned}", True)
    if "OpenSSF Scorecard" not in info:
        return AttemptResult(1, "scorecard-master", "Scorecard must stay informational", True)
    return AttemptResult(
        0,
        "scorecard-master",
        f"scorecard.yml + badge; required checks aligned to {branch}",
        False,
    )


def automate_scorecard_master_protection(root: Path, cfg: dict) -> AttemptResult:
    local = check_scorecard_local(root)
    if local.exit_code != 0:
        return local
    os.environ["GITHUB_DEFAULT_BRANCH"] = default_branch(root)
    applied = automate_branch_protection(root, cfg)
    if applied.exit_code != 0:
        return applied
    return AttemptResult(0, "scorecard-master", f"{local.reason}; protection on {default_branch(root)}", False)


def check_waiting_local(root: Path) -> int:
    code = 0
    for fn in (automate_f009_signing, automate_sacred_examples_skip, check_scorecard_local):
        result = fn(root, {})
        print(f"{result.method}: exit={result.exit_code} {result.reason}")
        if result.exit_code != 0:
            code = 1
    return code


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else Path.cwd())
    return check_waiting_local(root.resolve())


if __name__ == "__main__":
    raise SystemExit(main())
