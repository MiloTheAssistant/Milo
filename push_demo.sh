#!/usr/bin/env bash
# Auto‑push script – adds/commits a new note and a Kanban card

set -euo pipefail

# --- Config - adjust if needed
REPO_ROOT="$(git rev-parse --show-toplevel)"
NOTE_DIR="$REPO_ROOT/SecondBrain/ideas"
BOARD_FILE="$REPO_ROOT/MiloKan/board.md"

# ----- Create note -----
NOTE_DATE=$(date +%Y-%m-%d)
NOTE_FILE="$NOTE_DIR/${NOTE_DATE}-push-demo.md"
cat > "${NOTE_FILE}" <<'MD'
---
# Sample note created by auto‑push script

tags: [automation, demo]
links:
  - https://docs.openclaw.ai
summary: "This is a demo note created automatically by the push script."
---

Sample content: The push script has successfully added this note.
MD

# ----- Add card to board -----
# Determine which column the card should go to – default 'In‑Progress'
COLUMNS=("Backlog" "In-Progress" "Done")
COLUMNS_MAP=("Backlog" "In‑Progress" "Done")
# Simple regex to split the markdown table into columns
REPLACE=$(grep -n "|" "$BOARD_FILE" | head -n 1 | cut -d: -f1)
if [[ -z "$REPLACE" ]]; then
  echo "Board file does not contain a table – skipping card addition"
else
  # Insert card into the second column (In-Progress)
  sed -i "${REPLACE}s/|\([^|]*\) |/|\1 | Added demo card for auto‑push |/" "$BOARD_FILE"
fi

# ----- Commit changes -----
cd "$REPO_ROOT"
git add "$NOTE_FILE" "$BOARD_FILE"

git commit -m "Auto‑push: add demo note and board card"

git push

echo "Push script finished – note and card added"
