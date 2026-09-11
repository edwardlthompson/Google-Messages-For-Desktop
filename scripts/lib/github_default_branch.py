"""Default git branch from .github/settings.yml (child: master)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def default_branch(root: Path | None = None) -> str:
    base = root or ROOT
    path = base / ".github" / "settings.yml"
    if path.is_file():
        match = re.search(
            r"(?m)^  default_branch:\s*(\S+)", path.read_text(encoding="utf-8")
        )
        if match:
            return match.group(1).strip().strip("\"'")
    return "main"


def main() -> int:
    print(default_branch(Path.cwd() if len(sys.argv) < 2 else Path(sys.argv[1])))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
