"""
Search recent tweets (last 7 days on free/basic tier).

Usage:
  python tools/x/x_search.py --query "#AI" --limit 20
  python tools/x/x_search.py --query "from:MiloTheAssistant" --limit 10
  python tools/x/x_search.py --query "to:MiloTheAssistant" --limit 10
"""
import argparse
import json
from x_client import get_client

TWEET_FIELDS = ["created_at", "public_metrics", "author_id", "conversation_id"]
EXPANSIONS = ["author_id"]
USER_FIELDS = ["name", "username"]


def search(query: str, limit: int = 20) -> list[dict]:
    client = get_client()
    response = client.search_recent_tweets(
        query=query,
        max_results=min(limit, 100),
        tweet_fields=TWEET_FIELDS,
        expansions=EXPANSIONS,
        user_fields=USER_FIELDS,
    )
    if not response.data:
        return []
    users = {}
    if response.includes and "users" in response.includes:
        users = {u.id: {"name": u.name, "username": u.username}
                 for u in response.includes["users"]}
    results = []
    for tweet in response.data:
        t = {
            "id": str(tweet.id),
            "text": tweet.text,
            "created_at": str(tweet.created_at) if tweet.created_at else None,
        }
        if tweet.public_metrics:
            t["metrics"] = dict(tweet.public_metrics)
        if tweet.author_id and tweet.author_id in users:
            t["author"] = users[tweet.author_id]
        results.append(t)
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Search X")
    parser.add_argument("--query", required=True, help="Search query")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()
    print(json.dumps(search(args.query, args.limit), indent=2))
