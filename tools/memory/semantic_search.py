#!/usr/bin/env python3
"""Semantic search over memory using TF-IDF similarity.

Falls back to keyword search if scikit-learn is not installed.
Install for better results: pip install scikit-learn
"""

import argparse
import sqlite3
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[2]
MEMORY_DB = WORKSPACE / "data" / "memory.db"

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


def get_all_entries() -> list[dict]:
    if not MEMORY_DB.exists():
        return []
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM memory_entries ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def semantic_search(query: str, limit: int = 10):
    entries = get_all_entries()
    if not entries:
        print("No memory entries found")
        return

    if not HAS_SKLEARN:
        print("(scikit-learn not installed — falling back to keyword match)")
        query_lower = query.lower()
        scored = []
        for e in entries:
            content_lower = e["content"].lower()
            words = query_lower.split()
            matches = sum(1 for w in words if w in content_lower)
            if matches > 0:
                scored.append((matches / len(words), e))
        scored.sort(key=lambda x: x[0], reverse=True)
        for score, entry in scored[:limit]:
            print(f"[{entry['id']}] (score: {score:.2f}) [{entry['entry_type']}] {entry['content']}")
        if not scored:
            print(f"No matches for '{query}'")
        return

    corpus = [e["content"] for e in entries]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus + [query])

    query_vec = tfidf_matrix[-1]
    doc_vecs = tfidf_matrix[:-1]
    similarities = cosine_similarity(query_vec, doc_vecs).flatten()

    ranked = sorted(enumerate(similarities), key=lambda x: x[1], reverse=True)

    found = False
    for idx, score in ranked[:limit]:
        if score > 0.05:
            entry = entries[idx]
            print(f"[{entry['id']}] (score: {score:.2f}) [{entry['entry_type']}] {entry['content']}")
            found = True
    if not found:
        print(f"No semantically similar results for '{query}'")


def main():
    parser = argparse.ArgumentParser(description="Semantic search over memory")
    parser.add_argument("--query", required=True, help="Search query")
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    semantic_search(args.query, args.limit)


if __name__ == "__main__":
    main()
