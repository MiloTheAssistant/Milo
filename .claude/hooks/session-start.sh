#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install Python dependencies
pip install -r "$CLAUDE_PROJECT_DIR/requirements.txt"

# Make shell scripts executable
chmod +x "$CLAUDE_PROJECT_DIR/MiloKan/generate_board.sh" "$CLAUDE_PROJECT_DIR/calendar_sync.sh"
