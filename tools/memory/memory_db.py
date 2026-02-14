#!/usr/bin/env python3
"""Direct database operations for memory: search, list, delete, stats."""

import argparse
import sqlite3
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[2]
MEMORY_DB = WORKSPACE / "data" / "memory.db"
ACTIVITY_DB = WORKSPACE / "data" / "activity.db"


def ensure_dbs():
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

    conn = sqlite3.connect(ACTIVITY_DB)
    conn.execute("""CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        source TEXT,
        request TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        summary TEXT
    )""")
    conn.commit()
    conn.close()


def search(query: str, entry_type: str | None = None, limit: int = 20):
    ensure_dbs()
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row

    sql = "SELECT * FROM memory_entries WHERE content LIKE ?"
    params: list = [f"%{query}%"]

    if entry_type:
        sql += " AND entry_type = ?"
        params.append(entry_type)

    sql += " ORDER BY importance DESC, created_at DESC LIMIT ?"
    params.append(limit)

    rows = conn.execute(sql, params).fetchall()
    conn.close()

    if not rows:
        print(f"No results for '{query}'")
        return

    for row in rows:
        print(f"[{row['id']}] [{row['entry_type']}] (imp: {row['importance']}) {row['content']}  ({row['created_at']})")


def list_entries(entry_type: str | None = None, limit: int = 20):
    ensure_dbs()
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row

    if entry_type:
        rows = conn.execute(
            "SELECT * FROM memory_entries WHERE entry_type = ? ORDER BY created_at DESC LIMIT ?",
            (entry_type, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM memory_entries ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    conn.close()

    if not rows:
        print("No entries found")
        return

    for row in rows:
        print(f"[{row['id']}] [{row['entry_type']}] (imp: {row['importance']}) {row['content']}  ({row['created_at']})")


def delete_entry(entry_id: int):
    ensure_dbs()
    conn = sqlite3.connect(MEMORY_DB)
    deleted = conn.execute("DELETE FROM memory_entries WHERE id = ?", (entry_id,)).rowcount
    conn.commit()
    conn.close()
    print(f"Deleted {deleted} entry(ies) with id={entry_id}")


def stats():
    ensure_dbs()
    conn = sqlite3.connect(MEMORY_DB)
    total = conn.execute("SELECT COUNT(*) FROM memory_entries").fetchone()[0]
    types = conn.execute(
        "SELECT entry_type, COUNT(*) as cnt FROM memory_entries GROUP BY entry_type ORDER BY cnt DESC"
    ).fetchall()
    conn.close()

    print(f"Total entries: {total}")
    for t, c in types:
        print(f"  {t}: {c}")


def main():
    parser = argparse.ArgumentParser(description="Memory database operations")
    parser.add_argument("--action", required=True, choices=["search", "list", "delete", "stats", "init"])
    parser.add_argument("--query", help="Search query")
    parser.add_argument("--type", help="Filter by entry type")
    parser.add_argument("--id", type=int, help="Entry ID (for delete)")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    if args.action == "search":
        if not args.query:
            print("--query required for search")
            return
        search(args.query, args.type, args.limit)
    elif args.action == "list":
        list_entries(args.type, args.limit)
    elif args.action == "delete":
        if args.id is None:
            print("--id required for delete")
            return
        delete_entry(args.id)
    elif args.action == "stats":
        stats()
    elif args.action == "init":
        ensure_dbs()
        print("Databases initialized")


if __name__ == "__main__":
    main()
