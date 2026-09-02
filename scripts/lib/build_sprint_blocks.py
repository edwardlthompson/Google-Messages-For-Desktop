"""Find Sprint blocks in BUILD_PLAN (playbook ### Sprint or child ## Sprint)."""
from __future__ import annotations

import re

from build_sprint_model import H2_SPRINT_HEADER, SPRINT_HEADER


def parse_sprint_blocks(text: str) -> list[tuple[str, list[str]]]:
    playbook = _parse_playbook_sprints(text)
    if playbook:
        return playbook
    return _parse_h2_sprints(text)


def collect_sprint(
    lines: list[str], start: int, header_re: re.Pattern[str]
) -> tuple[tuple[str, list[str]], int]:
    line = lines[start]
    title = line.strip().lstrip("#").strip()
    block_lines: list[str] = [line]
    i = start + 1
    while i < len(lines) and not (
        header_re.match(lines[i])
        or (lines[i].startswith("## ") and not lines[i].startswith("### "))
    ):
        block_lines.append(lines[i])
        i += 1
    return (title, block_lines), i


def _parse_playbook_sprints(text: str) -> list[tuple[str, list[str]]]:
    blocks: list[tuple[str, list[str]]] = []
    in_child = False
    i = 0
    lines = text.splitlines()
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith("## Child Repo Playbook"):
            in_child = True
            i += 1
            continue
        if not in_child:
            i += 1
            continue
        if line.startswith("## Ongoing Maintenance"):
            break
        if SPRINT_HEADER.match(line):
            block, i = collect_sprint(lines, i, SPRINT_HEADER)
            blocks.append(block)
            continue
        i += 1
    return blocks


def _parse_h2_sprints(text: str) -> list[tuple[str, list[str]]]:
    """Child product boards use `## Sprint E` (not under Child Repo Playbook)."""
    blocks: list[tuple[str, list[str]]] = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        if H2_SPRINT_HEADER.match(lines[i]):
            block, i = collect_sprint(lines, i, H2_SPRINT_HEADER)
            blocks.append(block)
            continue
        i += 1
    return blocks
