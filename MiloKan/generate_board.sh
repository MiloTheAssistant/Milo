#!/usr/bin/env bash
# generate_board.sh — Scan goals/ and tools/ to build a Kanban-style summary,
# then optionally push it to Telegram.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BOARD_FILE="$REPO_ROOT/MiloKan/board.md"

# ── Gather columns ──────────────────────────────────────────────
backlog=()
in_progress=()
done_items=()

for f in "$REPO_ROOT"/goals/*.md "$REPO_ROOT"/2Brain/*.md; do
  [ -f "$f" ] || continue
  name="$(basename "$f" .md)"

  # Read optional status from front-matter (status: backlog | in_progress | done)
  status="backlog"
  if head -5 "$f" | grep -qi '^status:'; then
    status="$(head -5 "$f" | grep -i '^status:' | head -1 | cut -d: -f2 | tr -d ' ' | tr '[:upper:]' '[:lower:]')"
  fi

  case "$status" in
    done|completed) done_items+=("$name") ;;
    in_progress|active) in_progress+=("$name") ;;
    *) backlog+=("$name") ;;
  esac
done

# ── Render board ────────────────────────────────────────────────
{
  echo "# Milo Kanban Board"
  echo ""
  echo "_Auto-generated on $(date -u '+%Y-%m-%d %H:%M UTC')_"
  echo ""
  echo "## Backlog"
  for item in "${backlog[@]+"${backlog[@]}"}"; do echo "- [ ] $item"; done
  [ ${#backlog[@]} -eq 0 ] && echo "_empty_"
  echo ""
  echo "## In Progress"
  for item in "${in_progress[@]+"${in_progress[@]}"}"; do echo "- [~] $item"; done
  [ ${#in_progress[@]} -eq 0 ] && echo "_empty_"
  echo ""
  echo "## Done"
  for item in "${done_items[@]+"${done_items[@]}"}"; do echo "- [x] $item"; done
  [ ${#done_items[@]} -eq 0 ] && echo "_empty_"
} > "$BOARD_FILE"

echo "Board written to $BOARD_FILE"

# ── Telegram notification ───────────────────────────────────────
if [ -n "${TELEGRAM_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
  # Build a compact message
  msg="📋 *Milo Kanban Update*%0A"
  msg+="Backlog: ${#backlog[@]} · In Progress: ${#in_progress[@]} · Done: ${#done_items[@]}%0A"
  msg+="$(date -u '+%Y-%m-%d %H:%M UTC')"

  response=$(curl -s -w "\n%{http_code}" \
    "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    -d "text=${msg}" \
    -d "parse_mode=Markdown")

  http_code=$(echo "$response" | tail -1)
  if [ "$http_code" = "200" ]; then
    echo "Telegram notification sent"
  else
    echo "Telegram notification failed (HTTP $http_code)"
    echo "$response" | head -1
    exit 1
  fi
else
  echo "Skipping Telegram (TELEGRAM_TOKEN or TELEGRAM_CHAT_ID not set)"
fi
