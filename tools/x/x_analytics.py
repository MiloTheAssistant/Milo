"""
Fetch analytics for your own tweets (likes, retweets, replies, impressions).

Usage:
  python tools/x/x_analytics.py --limit 20
  python tools/x/x_analytics.py --tweet-id 1234567890
"""
import argparse
import json
from x_client import get_client

TWEET_FIELDS = ["created_at", "public_metrics", "non_public_metrics", "organic_metrics"]


def get_tweet_analytics(tweet_id: str) -> dict:
    client = get_client()
    response = client.get_tweet(
        id=tweet_id,
        tweet_fields=TWEET_FIELDS,
    )
    t = response.data
    return {
        "id": str(t.id),
        "text": t.text,
        "created_at": str(t.created_at) if t.created_at else None,
        "public_metrics": dict(t.public_metrics) if t.public_metrics else {},
    }


def get_own_analytics(limit: int = 20) -> list[dict]:
    client = get_client()
    me = client.get_me()
    user_id = me.data.id
    response = client.get_users_tweets(
        id=user_id,
        max_results=min(limit, 100),
        tweet_fields=["created_at", "public_metrics"],
    )
    if not response.data:
        return []
    results = []
    for tweet in response.data:
        results.append({
            "id": str(tweet.id),
            "text": tweet.text[:100] + "..." if len(tweet.text) > 100 else tweet.text,
            "created_at": str(tweet.created_at) if tweet.created_at else None,
            "metrics": dict(tweet.public_metrics) if tweet.public_metrics else {},
        })
    # Sort by engagement (likes + retweets + replies)
    results.sort(
        key=lambda x: sum(x["metrics"].values()) if x["metrics"] else 0,
        reverse=True
    )
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="X analytics")
    parser.add_argument("--tweet-id", help="Specific tweet ID")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    if args.tweet_id:
        print(json.dumps(get_tweet_analytics(args.tweet_id), indent=2))
    else:
        print(json.dumps(get_own_analytics(args.limit), indent=2))
