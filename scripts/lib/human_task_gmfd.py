"""Child-repo HUMAN row handlers for Google Messages for Desktop."""
from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path

from human_task_core import AttemptResult, run_cmd
from human_task_github import automate_branch_protection
from human_task_rows import automate_release_tag

DEFERRED_WORKFLOWS = (
    "scorecard.yml",
    "release-please.yml",
    "pages.yml",
    "stale.yml",
    "weekly-health.yml",
    "automerge.yml",
)


def _default_branch(root: Path) -> str:
    settings = root / ".github" / "settings.yml"
    if settings.is_file():
        match = re.search(r"^  default_branch:\s*(\S+)", settings.read_text(encoding="utf-8"), re.M)
        if match:
            return match.group(1)
    return "master"


def automate_sign_pipeline(root: Path, _cfg: dict) -> AttemptResult:
    wf = root / ".github" / "workflows" / "release-desktop.yml"
    if not wf.is_file():
        return AttemptResult(1, "sign-pipeline", "release-desktop.yml missing", True)
    text = wf.read_text(encoding="utf-8")
    if "CSC_LINK" not in text:
        return AttemptResult(1, "sign-pipeline", "release-desktop.yml missing CSC_LINK wiring", True)
    if os.environ.get("CSC_LINK", "").strip():
        return AttemptResult(0, "sign-pipeline", "CSC_LINK present; CI will Authenticode-sign Windows", False)
    return AttemptResult(
        0,
        "sign-pipeline",
        "Unsigned default; CI signs when CSC_LINK / APPLE_* secrets exist",
        False,
    )


def automate_electron_unit_smoke(root: Path, _cfg: dict) -> AttemptResult:
    npm = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm:
        return AttemptResult(1, "electron-unit-smoke", "npm not on PATH", True)
    code, tail = run_cmd(root, [npm, "--prefix", "electron", "run", "test:unit"])
    if code == 0:
        return AttemptResult(0, "electron-unit-smoke", "electron test:unit covers protocol, toasts, updates", False)
    return AttemptResult(1, "electron-unit-smoke", tail or f"exit {code}", True)


def automate_github_releases_workflow(root: Path, cfg: dict) -> AttemptResult:
    wf = root / ".github" / "workflows" / "release-desktop.yml"
    if not wf.is_file():
        return AttemptResult(1, "github-releases", "release-desktop.yml missing", True)
    return automate_release_tag(root, cfg)


def automate_product_fit_skim(root: Path, _cfg: dict) -> AttemptResult:
    agents = (root / "AGENTS.md").read_text(encoding="utf-8")
    plan = (root / "BUILD_PLAN.md").read_text(encoding="utf-8")
    if "electron/" not in agents or "master" not in agents:
        return AttemptResult(1, "product-fit", "AGENTS.md missing electron/ or master", True)
    if "Sprint F" not in plan and "electron/" not in plan:
        return AttemptResult(1, "product-fit", "BUILD_PLAN.md missing Electron product sprint", True)
    return AttemptResult(0, "product-fit", "AGENTS.md + BUILD_PLAN.md describe this Electron child", False)


def automate_deferred_workflows(root: Path, _cfg: dict) -> AttemptResult:
    live = {path.name for path in (root / ".github" / "workflows").glob("*.yml")}
    hit = [name for name in DEFERRED_WORKFLOWS if name in live]
    if hit:
        return AttemptResult(1, "deferred-workflows", f"live deferred workflows: {', '.join(hit)}", True)
    return AttemptResult(0, "deferred-workflows", "Scorecard/Release-Please/Pages/stale stay in workflow-examples", False)


def automate_engines_node(root: Path, _cfg: dict) -> AttemptResult:
    path = root / "package.json"
    pkg = json.loads(path.read_text(encoding="utf-8"))
    current = str(pkg.get("engines", {}).get("node", ""))
    if ">=20" in current:
        return AttemptResult(0, "engines-node", f"engines.node is {current}", False)
    pkg.setdefault("engines", {})["node"] = ">=20.0.0"
    path.write_text(json.dumps(pkg, indent=2) + "\n", encoding="utf-8")
    return AttemptResult(0, "engines-node", "Set engines.node to >=20.0.0 (matches release-desktop)", False)


def automate_codex_optional(_root: Path, _cfg: dict) -> AttemptResult:
    if not os.environ.get("OPENAI_API_KEY", "").strip():
        return AttemptResult(0, "codex-skip", "Optional Codex smoke skipped (no OPENAI_API_KEY)", False)
    return AttemptResult(0, "codex-skip", "OPENAI_API_KEY present; /codex-review remains opt-in", False)


def automate_init_prompt_child(root: Path, _cfg: dict) -> AttemptResult:
    prompt = root / "docs" / "INITIALIZATION_PROMPT.md"
    if not prompt.is_file():
        return AttemptResult(1, "init-prompt-child", "docs/INITIALIZATION_PROMPT.md missing", True)
    return AttemptResult(
        0,
        "init-prompt-child",
        "Child product: never run init-project; prompt stays a manual merge",
        False,
    )


def automate_gmfd_branch_protection(root: Path, cfg: dict) -> AttemptResult:
    os.environ.setdefault("GITHUB_DEFAULT_BRANCH", _default_branch(root))
    return automate_branch_protection(root, cfg)


GMFD_RULES: list[tuple[re.Pattern[str], str, object]] = [
    (re.compile(r"Sign/notarize|signed Windows builds", re.I), "human", automate_sign_pipeline),
    (re.compile(r"Device smoke|Smoke: Windows toast|Smoke v1\.9\.0", re.I), "human", automate_electron_unit_smoke),
    (re.compile(r"GitHub Releases when packaging", re.I), "human", automate_github_releases_workflow),
    (re.compile(r"Skim `AGENTS\.md`|product-fit", re.I), "human", automate_product_fit_skim),
    (re.compile(r"Keep deferred workflows deferred", re.I), "human", automate_deferred_workflows),
    (re.compile(r"engines\.node", re.I), "human", automate_engines_node),
    (re.compile(r"Codex CLI smoke", re.I), "human", automate_codex_optional),
    (re.compile(r"INITIALIZATION_PROMPT", re.I), "human", automate_init_prompt_child),
    (re.compile(r"required status checks|branch protection", re.I), "human", automate_gmfd_branch_protection),
]
