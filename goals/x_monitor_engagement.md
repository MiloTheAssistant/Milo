# Goal: Monitor Engagement on X

## Objective
Review mentions, check analytics on recent posts, and optionally engage (like, reply, retweet) with relevant interactions.

## When to Use
- User asks to check mentions or notifications
- User wants to see how recent tweets are performing
- User wants to engage with replies or mentions

## Inputs
- **action** — What to check: `mentions`, `analytics`, or `engage`
- **limit** (optional) — Number of results (default 20, max 100)
- **tweet_id** (optional) — Specific tweet to check analytics for

## Process

### Check Mentions
1. Fetch mentions: `python tools/x/x_timeline.py --feed mentions --limit <n>`
2. Summarize who mentioned the account and what they said
3. Flag any mentions that look like they need a reply

### Check Analytics
1. Fetch own tweet analytics: `python tools/x/x_analytics.py --limit <n>`
2. Results come pre-sorted by engagement (highest first)
3. Summarize top performers and any notable trends

### Engage with Content
1. Identify the target tweet ID and desired action
2. Run engagement: `python tools/x/x_engage.py --action <like|retweet|follow> --tweet-id <id>`
3. For follows: `python tools/x/x_engage.py --action follow --username <handle>`
4. Confirm the action was completed

## Expected Output
- Mentions: list of tweets with author, text, and timestamp
- Analytics: ranked list of own tweets by engagement metrics
- Engage: confirmation of the action taken

## Edge Cases
- No mentions found → report "no new mentions"
- Analytics on free tier → `non_public_metrics` may not be available
- Follow/unfollow requires username, like/retweet requires tweet ID
- Rate limits handled automatically by tweepy

## Tools Used
- `tools/x/x_timeline.py`
- `tools/x/x_analytics.py`
- `tools/x/x_engage.py`
- `tools/x/x_search.py` (optional, for finding relevant content)
