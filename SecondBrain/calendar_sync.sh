# Calendar sync script – SecondBrain/calendar_sync.sh
#!/usr/bin/env bash
# This script scans notes for a `date:` front‑matter field and generates a simple "Outlook" / "iCal" file.
# The produced file can be imported into any calendar app.

# Create output directory if missing
mkdir -p calendar_export

# Header of the .ics file
cat > calendar_export/brain_events.ics <<'ICS'
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MiloTheAssistant//SecondBrain//EN
ICS

# Find all notes with a date field
find SecondBrain -name '*.md' | while read -r file; do
  content=$(<"$file")
  # Grab date line
  date_line=$(echo "$content" | grep -m1 '^date:')
  if [[ -z "$date_line" ]]; then
    continue
  fi
  date_str=${date_line#date:}
  date_str=${date_str%%[ "\n]*}    # trim
  # Title – first heading after front‑matter
  title=$(echo "$content" | sed -n '/^---$/q;p' | grep -m1 '^#' | sed 's/^#\s*//')
  if [[ -z "$title" ]]; then
    title=$(basename $file .md)
  fi

  # Convert date to YYYYMMDD
  date_ics=${date_str//-/}

  cat >> calendar_export/brain_events.ics <<EOT
BEGIN:VEVENT
DTSTAMP:$(date -u +%Y%m%dT%H%M%SZ)
DTSTART;VALUE=DATE:$date_ics
SUMMARY:$title
LOCATION:SecondBrain:$file
END:VEVENT
EOT

  echo "Added $file to calendar"

done

cat >> calendar_export/brain_events.ics <<'ICS'
END:VCALENDAR
ICS

echo "Calendar export written to calendar_export/brain_events.ics"
