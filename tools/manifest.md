# Tools Manifest

> Index of all available tools. Always check here before writing new scripts.

---

## X (Twitter) — `tools/x/`

| Script | Description |
|---|---|
| `x_client.py` | Shared X API client — import `get_client()` / `get_api()` from here |
| `x_post.py` | Post a tweet or thread; supports replies |
| `x_timeline.py` | Fetch home timeline, mentions, or your own posts |
| `x_search.py` | Search recent tweets (last 7 days) by query |
| `x_engage.py` | Like, unlike, retweet, unretweet, follow, unfollow |
| `x_analytics.py` | Fetch engagement metrics for your own tweets |

---

## Memory — `tools/memory/`

| Script | Description |
|---|---|
| `memory_read.py` | Read MEMORY.md, daily logs, and recent DB entries into a single context |
| `memory_write.py` | Write to daily logs, store entries in DB, or update MEMORY.md sections |
| `memory_db.py` | Direct DB operations: search, list, delete, stats, init |
| `semantic_search.py` | TF-IDF similarity search over memory entries (falls back to keyword) |
| `hybrid_search.py` | Combined search across DB, MEMORY.md, and daily logs |
