#!/usr/bin/env python3
"""Read memory from MEMORY.md, daily logs, and the memory database."""

import argparse
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[2]
MEMORY_MD = WORKSPACE / "memory" / "MEMORY.md"
LOGS_DIR = WORKSPACE / "memory" / "logs"
MEMORY_DB = WORKSPACE / "data" / "memory.db"


def read_memory_md() -> str:
    if MEMORY_MD.exists():
        return MEMORY_MD.read_text()
    return "(MEMORY.md not found)"


def read_daily_log(date_str: str) -> str:
    log_file = LOGS_DIR / f"{date_str}.md"
    if log_file.exists():
        return log_file.read_text()
    return f"(No log for {date_str})"


def read_recent_db_entries(limit: int = 20) -> list[dict]:
    if not MEMORY_DB.exists():
        return []
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT * FROM memory_entries ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def format_markdown(curated: str, today_log: str, yesterday_log: str, db_entries: list[dict]) -> str:
    parts = [
        "# Memory Context\n",
        "## Curated Memory (MEMORY.md)\n",
        curated,
        "\n---\n",
        "## Today's Log\n",
        today_log,
        "\n---\n",
        "## Yesterday's Log\n",
        yesterday_log,
    ]
    if db_entries:
        parts.append("\n---\n\n## Recent Database Entries\n")
        for entry in db_entries:
            parts.append(
                f"- [{entry.get('entry_type', 'fact')}] "
                f"(importance: {entry.get('importance', 5)}) "
                f"{entry.get('content', '')}\n"
            )
    return "\n".join(parts)


def main():
    parser = argparse.ArgumentParser(description="Read memory context")
    parser.add_argument("--format", choices=["markdown", "raw"], default="markdown")
    parser.add_argument("--date", help="Specific date (YYYY-MM-DD)", default=None)
    parser.add_argument("--limit", type=int, default=20, help="Max DB entries to show")
    args = parser.parse_args()

    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    curated = read_memory_md()
    today_log = read_daily_log(args.date or today)
    yesterday_log = read_daily_log(yesterday)
    db_entries = read_recent_db_entries(args.limit)

    if args.format == "markdown":
        print(format_markdown(curated, today_log, yesterday_log, db_entries))
    else:
        print(curated)
        print("\n---\n")
        print(today_log)


if __name__ == "__main__":
    main()
