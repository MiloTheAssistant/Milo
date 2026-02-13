"""
Fetch your home timeline, mentions, or your own posts.

Usage:
  python tools/x/x_timeline.py --feed home --limit 20
  python tools/x/x_timeline.py --feed mentions --limit 10
  python tools/x/x_timeline.py --feed own --limit 50
"""
import argparse
import json
import sys
from x_client import get_client

TWEET_FIELDS = ["created_at", "public_metrics", "author_id", "conversation_id"]
EXPANSIONS = ["author_id"]
USER_FIELDS = ["name", "username"]


def get_own_tweets(limit: int = 20) -> list[dict]:
    client = get_client()
    me = client.get_me()
    user_id = me.data.id
    response = client.get_users_tweets(
        id=user_id,
        max_results=min(limit, 100),
        tweet_fields=TWEET_FIELDS,
    )
    return _format(response)


def get_mentions(limit: int = 20) -> list[dict]:
    client = get_client()
    me = client.get_me()
    user_id = me.data.id
    response = client.get_users_mentions(
        id=user_id,
        max_results=min(limit, 100),
        tweet_fields=TWEET_FIELDS,
        expansions=EXPANSIONS,
        user_fields=USER_FIELDS,
    )
    return _format(response)


def get_home_timeline(limit: int = 20) -> list[dict]:
    client = get_client()
    response = client.get_home_timeline(
        max_results=min(limit, 100),
        tweet_fields=TWEET_FIELDS,
        expansions=EXPANSIONS,
        user_fields=USER_FIELDS,
    )
    return _format(response)


def _format(response) -> list[dict]:
    if not response.data:
        return []
    results = []
    users = {}
    if response.includes and "users" in response.includes:
        users = {u.id: {"name": u.name, "username": u.username}
                 for u in response.includes["users"]}
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
    parser = argparse.ArgumentParser(description="Fetch X timeline")
    parser.add_argument("--feed", choices=["home", "mentions", "own"], default="own")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    if args.feed == "home":
        data = get_home_timeline(args.limit)
    elif args.feed == "mentions":
        data = get_mentions(args.limit)
    else:
        data = get_own_tweets(args.limit)

    print(json.dumps(data, indent=2))
