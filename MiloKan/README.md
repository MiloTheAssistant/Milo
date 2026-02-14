# Updated README for MiloKan – Telegram integration guide
# ... existing content ...

## Telegram Updates

The board update script sends a short message to a Telegram chat.

1. Create a Telegram bot and get its **token** (via @BotFather).  
2. Decide which chat/group to notify and get the **chat ID** (send a message to the bot in that chat and look at the `chat_id`).  
3. Edit the repo root **`.env`** file:
   ```
   TELEGRAM_TOKEN="YOUR_BOT_TOKEN"
   TELEGRAM_CHAT_ID="CHAT_ID_OR_USER_ID"
   ```
4. Commit and push.  The next time `generate_board.sh` runs (via push or a GitHub Action), a notification will fire.

If you prefer not to commit the token, export the variables in your shell or add them as GitHub Action secrets.
