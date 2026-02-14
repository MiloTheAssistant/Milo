#!/usr/bin/env python3
"""Write to daily logs, the memory database, or update MEMORY.md sections."""

import argparse
import re
import sqlite3
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[2]
MEMORY_MD = WORKSPACE / "memory" / "MEMORY.md"
LOGS_DIR = WORKSPACE / "memory" / "logs"
MEMORY_DB = WORKSPACE / "data" / "memory.db"


def ensure_db():
    MEMORY_DB.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(MEMORY_DB)
    conn.execute("""CREATE TABLE IF NOT EXISTS memory_entries (
        id INTEGER PRIMARY KEY,
        content TEXT NOT NULL,
        entry_type TEXT DEFAULT 'fact',
        importance INTEGER DEFAULT 5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )""")
    conn.commit()
    conn.close()


def write_to_log(content: str, date_str: str | None = None):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    date_str = date_str or datetime.now().strftime("%Y-%m-%d")
    log_file = LOGS_DIR / f"{date_str}.md"

    if not log_file.exists():
        day_name = datetime.strptime(date_str, "%Y-%m-%d").strftime("%A, %B %d, %Y")
        log_file.write_text(
            f"# Daily Log: {date_str}\n\n"
            f"> Session log for {day_name}\n\n"
            f"---\n\n"
            f"## Events & Notes\n\n"
        )

    timestamp = datetime.now().strftime("%H:%M")
    with open(log_file, "a") as f:
        f.write(f"- [{timestamp}] {content}\n")

    print(f"Logged to {log_file.name}: {content}")


def write_to_db(content: str, entry_type: str = "fact", importance: int = 5):
    ensure_db()
    conn = sqlite3.connect(MEMORY_DB)
    conn.execute(
        "INSERT INTO memory_entries (content, entry_type, importance) VALUES (?, ?, ?)",
        (content, entry_type, importance),
    )
    conn.commit()
    conn.close()
    print(f"Stored [{entry_type}] (importance: {importance}): {content}")


def update_memory_md(content: str, section: str):
    if not MEMORY_MD.exists():
        print("MEMORY.md not found")
        return

    text = MEMORY_MD.read_text()

    # Map friendly section names to headers
    section_map = {
        "user_preferences": "## User Preferences",
        "key_facts": "## Key Facts",
        "learned_behaviors": "## Learned Behaviors",
        "current_projects": "## Current Projects",
        "technical_context": "## Technical Context",
    }
    header = section_map.get(section, f"## {section}")

    # Find the section and append the new bullet
    pattern = re.compile(rf"({re.escape(header)}\n)(.*?)(\n## |\n---|\Z)", re.DOTALL)
    match = pattern.search(text)

    if match:
        section_content = match.group(2).rstrip()
        # Remove placeholder lines
        section_content = re.sub(r"\n?- \(.*?\)", "", section_content)
        new_section = f"{match.group(1)}{section_content}\n- {content}\n{match.group(3)}"
        text = text[: match.start()] + new_section + text[match.end() :]
    else:
        # Append new section before the footer
        text = text.rstrip() + f"\n\n{header}\n\n- {content}\n"

    # Update timestamp
    text = re.sub(
        r"\*Last updated:.*?\*",
        f"*Last updated: {datetime.now().strftime('%Y-%m-%d')}*",
        text,
    )

    MEMORY_MD.write_text(text)
    print(f"Updated MEMORY.md [{section}]: {content}")


def main():
    parser = argparse.ArgumentParser(description="Write to memory")
    parser.add_argument("--content", required=True, help="Content to store")
    parser.add_argument("--type", default="fact", help="Entry type: fact, preference, event, insight, task, relationship")
    parser.add_argument("--importance", type=int, default=5, help="Importance 1-10")
    parser.add_argument("--update-memory", action="store_true", help="Update MEMORY.md instead of DB")
    parser.add_argument("--section", default="key_facts", help="MEMORY.md section to update")
    parser.add_argument("--date", default=None, help="Date for log entry (YYYY-MM-DD)")
    args = parser.parse_args()

    if args.update_memory:
        update_memory_md(args.content, args.section)
    elif args.type == "event":
        write_to_log(args.content, args.date)
        write_to_db(args.content, args.type, args.importance)
    else:
        write_to_db(args.content, args.type, args.importance)


if __name__ == "__main__":
    main()
