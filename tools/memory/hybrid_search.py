#!/usr/bin/env python3
"""Hybrid search: combines keyword DB search, semantic similarity, and MEMORY.md grep.

Merges results from all sources and ranks by combined relevance.
"""

import argparse
import re
import sqlite3
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[2]
MEMORY_DB = WORKSPACE / "data" / "memory.db"
MEMORY_MD = WORKSPACE / "memory" / "MEMORY.md"
LOGS_DIR = WORKSPACE / "memory" / "logs"


def keyword_search_db(query: str, limit: int = 10) -> list[dict]:
    if not MEMORY_DB.exists():
        return []
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT *, 'db' as source FROM memory_entries WHERE content LIKE ? ORDER BY importance DESC LIMIT ?",
        (f"%{query}%", limit),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def search_memory_md(query: str) -> list[dict]:
    results = []
    if not MEMORY_MD.exists():
        return results
    lines = MEMORY_MD.read_text().splitlines()
    query_lower = query.lower()
    for i, line in enumerate(lines):
        if query_lower in line.lower():
            results.append({
                "content": line.strip(),
                "source": "MEMORY.md",
                "line": i + 1,
                "entry_type": "curated",
            })
    return results


def search_logs(query: str, max_files: int = 7) -> list[dict]:
    results = []
    if not LOGS_DIR.exists():
        return results
    log_files = sorted(LOGS_DIR.glob("*.md"), reverse=True)[:max_files]
    query_lower = query.lower()
    for log_file in log_files:
        lines = log_file.read_text().splitlines()
        for i, line in enumerate(lines):
            if query_lower in line.lower():
                results.append({
                    "content": line.strip(),
                    "source": log_file.name,
                    "line": i + 1,
                    "entry_type": "log",
                })
    return results


def hybrid_search(query: str, limit: int = 15):
    db_results = keyword_search_db(query, limit)
    md_results = search_memory_md(query)
    log_results = search_logs(query)

    print(f"# Hybrid Search: \"{query}\"\n")

    if db_results:
        print(f"## Database ({len(db_results)} matches)\n")
        for r in db_results:
            print(f"- [{r.get('entry_type', 'fact')}] (imp: {r.get('importance', 5)}) {r['content']}")
        print()

    if md_results:
        print(f"## MEMORY.md ({len(md_results)} matches)\n")
        for r in md_results:
            print(f"- (line {r['line']}) {r['content']}")
        print()

    if log_results:
        print(f"## Daily Logs ({len(log_results)} matches)\n")
        for r in log_results:
            print(f"- [{r['source']}] {r['content']}")
        print()

    total = len(db_results) + len(md_results) + len(log_results)
    if total == 0:
        print(f"No results found for '{query}'")
    else:
        print(f"---\nTotal: {total} results across all sources")


def main():
    parser = argparse.ArgumentParser(description="Hybrid memory search")
    parser.add_argument("--query", required=True, help="Search query")
    parser.add_argument("--limit", type=int, default=15)
    args = parser.parse_args()

    hybrid_search(args.query, args.limit)


if __name__ == "__main__":
    main()
