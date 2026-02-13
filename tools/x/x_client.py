"""
Shared X (Twitter) API client.
All X tools import get_client() / get_api() from here.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import tweepy

# Load .env from repo root
load_dotenv(Path(__file__).parents[2] / ".env")

def get_client() -> tweepy.Client:
    """Tweepy v2 Client (read/write via OAuth 1.0a + Bearer)."""
    return tweepy.Client(
        bearer_token=os.environ["X_BEARER_TOKEN"],
        consumer_key=os.environ["X_API_KEY"],
        consumer_secret=os.environ["X_API_KEY_SECRET"],
        access_token=os.environ["X_ACCESS_TOKEN"],
        access_token_secret=os.environ["X_ACCESS_TOKEN_SECRET"],
        wait_on_rate_limit=True,
    )

def get_api() -> tweepy.API:
    """Tweepy v1.1 API (media upload, etc.)."""
    auth = tweepy.OAuth1UserHandler(
        os.environ["X_API_KEY"],
        os.environ["X_API_KEY_SECRET"],
        os.environ["X_ACCESS_TOKEN"],
        os.environ["X_ACCESS_TOKEN_SECRET"],
    )
    return tweepy.API(auth, wait_on_rate_limit=True)
