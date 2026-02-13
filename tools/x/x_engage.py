"""
Engagement actions: like, retweet, unretweet, unlike, follow, unfollow.

Usage:
  python tools/x/x_engage.py --action like --tweet-id 1234567890
  python tools/x/x_engage.py --action retweet --tweet-id 1234567890
  python tools/x/x_engage.py --action follow --username elonmusk
  python tools/x/x_engage.py --action unfollow --username elonmusk
"""
import argparse
import json
from x_client import get_client


def run(action: str, tweet_id: str = None, username: str = None) -> dict:
    client = get_client()
    me = client.get_me()
    user_id = me.data.id

    if action == "like":
        r = client.like(tweet_id=tweet_id)
        return {"liked": r.data.get("liked")}

    elif action == "unlike":
        r = client.unlike(tweet_id=tweet_id)
        return {"liked": r.data.get("liked")}

    elif action == "retweet":
        r = client.retweet(tweet_id=tweet_id)
        return {"retweeted": r.data.get("retweeted")}

    elif action == "unretweet":
        r = client.unretweet(source_tweet_id=tweet_id)
        return {"retweeted": r.data.get("retweeted")}

    elif action == "follow":
        target = client.get_user(username=username)
        r = client.follow_user(target_user_id=target.data.id)
        return {"following": r.data.get("following")}

    elif action == "unfollow":
        target = client.get_user(username=username)
        r = client.unfollow_user(target_user_id=target.data.id)
        return {"following": r.data.get("following")}

    else:
        raise ValueError(f"Unknown action: {action}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="X engagement actions")
    parser.add_argument("--action", required=True,
                        choices=["like", "unlike", "retweet", "unretweet", "follow", "unfollow"])
    parser.add_argument("--tweet-id", help="Tweet ID (for like/retweet)")
    parser.add_argument("--username", help="Username (for follow/unfollow)")
    args = parser.parse_args()
    print(json.dumps(run(args.action, args.tweet_id, args.username), indent=2))
