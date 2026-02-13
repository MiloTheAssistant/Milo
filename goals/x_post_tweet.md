# Goal: Post a Tweet or Thread on X

## Objective
Compose and publish a single tweet or multi-part thread to the authenticated X account.

## When to Use
- User asks to post, tweet, or share something on X / Twitter
- User provides content to publish as a thread

## Inputs
- **text** (required) — The tweet body (max 280 characters per tweet)
- **thread** (optional) — Additional tweets for a thread
- **reply_to** (optional) — Tweet ID to reply to

## Process
1. Validate the content fits within character limits (280 per tweet)
2. If the content exceeds 280 characters and no thread split is provided, suggest splitting into a thread
3. Post using `tools/x/x_post.py`
   - Single tweet: `python tools/x/x_post.py --text "content"`
   - Thread: `python tools/x/x_post.py --text "first" --thread "second" "third"`
   - Reply: `python tools/x/x_post.py --text "content" --reply-to <tweet_id>`
4. Confirm the tweet was posted and return the tweet ID

## Expected Output
- JSON with `id` and `text` for each posted tweet

## Edge Cases
- Tweet over 280 chars → split into thread or ask user to shorten
- Rate limit hit → tweepy waits automatically (`wait_on_rate_limit=True`)
- API error → read error message, report to user, do not retry blindly
- Thread ordering → each tweet replies to the previous one automatically

## Tools Used
- `tools/x/x_post.py`
