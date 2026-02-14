# Update MiloKan/generate_board.sh to source .env
#!/usr/bin/env bash
# Load env for telegram vars
if [[ -f ".env" ]]; then
  source .env
fi

# ... existing code ...

# Send notification
bash "$(dirname "$0")/notify_telegram.sh"
