"""
Post a tweet / thread to X.

Usage:
  python tools/x/x_post.py --text "Hello world"
  python tools/x/x_post.py --text "1/2 First tweet" --thread "2/2 Second tweet"
  python tools/x/x_post.py --text "Check this out" --reply-to 1234567890
"""
import argparse
import json
import sys
from x_client import get_client


def post_tweet(text: str, reply_to: str = None) -> dict:
    client = get_client()
    kwargs = {"text": text}
    if reply_to:
        kwargs["in_reply_to_tweet_id"] = reply_to
    response = client.create_tweet(**kwargs)
    return {"id": response.data["id"], "text": response.data["text"]}


def post_thread(tweets: list[str]) -> list[dict]:
    results = []
    reply_to = None
    for text in tweets:
        result = post_tweet(text, reply_to=reply_to)
        reply_to = result["id"]
        results.append(result)
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Post to X")
    parser.add_argument("--text", required=True, help="Tweet text")
    parser.add_argument("--thread", nargs="*", help="Additional tweets for a thread")
    parser.add_argument("--reply-to", help="Tweet ID to reply to")
    args = parser.parse_args()

    if args.thread:
        results = post_thread([args.text] + args.thread)
        print(json.dumps(results, indent=2))
    else:
        result = post_tweet(args.text, reply_to=args.reply_to)
        print(json.dumps(result, indent=2))
