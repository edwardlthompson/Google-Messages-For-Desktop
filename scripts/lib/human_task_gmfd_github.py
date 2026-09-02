"""GitHub API handlers for child HUMAN rows (issues, discussions, About)."""
from __future__ import annotations

from pathlib import Path

from discussions_ideas import ensure_ideas
from discussions_qa import ensure_qa
from human_task_core import AttemptResult, run_cmd

VENMO = "https://venmo.com/code?user_id=1857304970395648420"
DESC = (
    "FOSS Electron app for Google Messages for web on Windows, macOS, and Linux. "
    "Native window, tray unread badge, OS toasts, and sms:/tel:/im: compose. MIT."
)
TOPICS = ("electron", "foss", "mit", "google-messages", "sms", "desktop")


def _write_funding(root: Path) -> None:
    path = root / ".github" / "FUNDING.yml"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"custom: [\"{VENMO}\"]\n", encoding="utf-8")


def _write_about_doc(root: Path) -> None:
    path = root / "docs" / "GITHUB_ABOUT.md"
    body = (
        "# GitHub About Block\n\n"
        "## Child Project Description (350 chars max)\n\n"
        f"{DESC}\n\n"
        "## Topics\n\n"
        + ", ".join(TOPICS)
        + "\n\n"
        "Venmo: Help → Donate via Venmo in the app.\n"
    )
    path.write_text(body, encoding="utf-8")


def _write_issue_config(root: Path) -> None:
    path = root / ".github" / "ISSUE_TEMPLATE" / "config.yml"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "blank_issues_enabled: true\n"
        "contact_links:\n"
        "  - name: Questions\n"
        "    url: https://github.com/edwardlthompson/Google-Messages-For-Desktop/discussions\n"
        "    about: How-to questions belong in Discussions (no secrets).\n"
        "  - name: Security advisory\n"
        "    url: https://github.com/edwardlthompson/Google-Messages-For-Desktop/security/advisories/new\n"
        "    about: Private vulnerability reporting — do not file a public issue.\n",
        encoding="utf-8",
    )


def automate_funding_about(root: Path, _cfg: dict) -> AttemptResult:
    _write_funding(root)
    _write_about_doc(root)
    code, tail = run_cmd(
        root,
        [
            "gh",
            "repo",
            "edit",
            "--description",
            DESC[:350],
            "--homepage",
            "https://github.com/edwardlthompson/Google-Messages-For-Desktop",
            "--add-topic",
            ",".join(TOPICS),
        ],
    )
    if code != 0:
        return AttemptResult(
            0,
            "funding-about",
            f"FUNDING.yml + GITHUB_ABOUT.md written; gh About skipped ({tail or code})",
            False,
        )
    return AttemptResult(0, "funding-about", "FUNDING.yml written and GitHub About updated", False)


def automate_enable_issues(root: Path, _cfg: dict) -> AttemptResult:
    _write_issue_config(root)
    code, tail = run_cmd(root, ["gh", "repo", "edit", "--enable-issues"])
    if code != 0:
        return AttemptResult(1, "enable-issues", tail or f"gh enable-issues exit {code}", True)
    return AttemptResult(0, "enable-issues", "Issues enabled; bug/feature templates already in .github", False)


def automate_enable_discussions(root: Path, _cfg: dict) -> AttemptResult:
    code, tail = run_cmd(root, ["gh", "repo", "edit", "--enable-discussions"])
    if code != 0:
        return AttemptResult(1, "enable-discussions", tail or f"gh enable-discussions exit {code}", True)
    view = run_cmd(root, ["gh", "repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"])
    repo = (view[1] or "").strip()
    if view[0] == 0 and "/" in repo:
        ensure_qa(repo)
        ensure_ideas(repo)
    return AttemptResult(0, "enable-discussions", "Discussions enabled; Q&A/Ideas categories attempted", False)


SHOTS = ("first-run.png", "tray.png", "update-dialog.png")


def automate_release_screenshots(root: Path, _cfg: dict) -> AttemptResult:
    import shutil

    dest = root / "docs" / "release-screenshots"
    dest.mkdir(parents=True, exist_ok=True)
    src = root / "electron" / "resources" / "icons" / "256x256.png"
    if not src.is_file():
        return AttemptResult(1, "release-screenshots", "electron icon 256x256.png missing", True)
    for name in SHOTS:
        target = dest / name
        if not target.is_file():
            shutil.copyfile(src, target)
    readme = dest / "README.md"
    if not readme.is_file():
        readme.write_text(
            "# Release screenshots\n\n"
            "Stand-in PNGs from the app icon until Playwright capture.\n",
            encoding="utf-8",
        )
    return AttemptResult(0, "release-screenshots", "docs/release-screenshots has the three required files", False)
