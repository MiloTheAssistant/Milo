#!/usr/bin/env bash
# calendar_sync.sh — Parse date: fields from 2Brain/ notes and emit a .ics file.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
ICS_FILE="$REPO_ROOT/MiloKan/milo_calendar.ics"

# ── ICS header ──────────────────────────────────────────────────
{
  echo "BEGIN:VCALENDAR"
  echo "VERSION:2.0"
  echo "PRODID:-//Milo//Calendar Sync//EN"
  echo "CALSCALE:GREGORIAN"
  echo "METHOD:PUBLISH"
} > "$ICS_FILE"

count=0

for f in "$REPO_ROOT"/2Brain/*.md; do
  [ -f "$f" ] || continue

  # Extract date from front-matter (date: YYYY-MM-DD)
  date_val=""
  title="$(basename "$f" .md)"

  if head -10 "$f" | grep -qi '^date:'; then
    date_val="$(head -10 "$f" | grep -i '^date:' | head -1 | cut -d: -f2- | tr -d ' ')"
  fi

  [ -z "$date_val" ] && continue

  # Normalise to YYYYMMDD
  ics_date="$(echo "$date_val" | tr -d '-')"

  # Extract optional description from front-matter
  desc=""
  if head -10 "$f" | grep -qi '^description:'; then
    desc="$(head -10 "$f" | grep -i '^description:' | head -1 | cut -d: -f2- | sed 's/^ *//')"
  fi

  {
    echo "BEGIN:VEVENT"
    echo "DTSTART;VALUE=DATE:${ics_date}"
    echo "DTEND;VALUE=DATE:${ics_date}"
    echo "SUMMARY:${title}"
    [ -n "$desc" ] && echo "DESCRIPTION:${desc}"
    echo "UID:${title}-${ics_date}@milo"
    echo "END:VEVENT"
  } >> "$ICS_FILE"

  count=$((count + 1))
done

echo "END:VCALENDAR" >> "$ICS_FILE"

echo "Calendar sync complete — $count event(s) written to $ICS_FILE"
