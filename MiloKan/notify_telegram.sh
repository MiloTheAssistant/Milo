# Update notify_telegram.sh to load .env if present
#!/usr/bin/env bash
# Load environment from .env if available
if [[ -f ".env" ]]; then
  source .env
fi

TOKEN="${TELEGRAM_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"

if [[ -z "$TOKEN" || -z "$CHAT_ID" ]]; then
  echo "Telegram credentials not set – skipping notification"
  exit 0
fi

MESSAGE="✅ Kanban board updated at $(date +%F %T)"

curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -d "chat_id=${CHAT_ID}" \
  -d "text=${MESSAGE}"

if [[ $? -eq 0 ]]; then
  echo "Telegram notification sent"
else
  echo "Failed to send Telegram notification"
fi
