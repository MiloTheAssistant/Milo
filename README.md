# milo

> Personal AI assistant powered by the GOTCHA Framework — automating X engagement, Kanban tracking, and calendar sync.

![Kanban](https://github.com/MiloTheAssistant/milo/actions/workflows/milo-kanban.yml/badge.svg)
![Calendar Sync](https://github.com/MiloTheAssistant/milo/actions/workflows/calendar_sync.yml/badge.svg)

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your X API credentials in .env
```

### 3. Test Telegram notifications (local)

```bash
export TELEGRAM_TOKEN=YOUR_BOT_TOKEN
export TELEGRAM_CHAT_ID=YOUR_CHAT_ID
bash MiloKan/generate_board.sh
# Should print "Telegram notification sent"
```

### 4. Test calendar sync (local)

```bash
bash calendar_sync.sh
# Generates MiloKan/milo_calendar.ics from 2Brain/ notes
```

---

## GitHub Setup

Add these **repository secrets** in Settings > Secrets and variables > Actions:

| Secret | Description |
|--------|-------------|
| `TELEGRAM_TOKEN` | Your Telegram bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Target chat/channel ID for notifications |

### Workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| **Milo Kanban** | Push to `goals/` or `2Brain/` | Regenerates board, sends Telegram ping |
| **Calendar Sync** | Nightly at 03:00 UTC + pushes to `2Brain/` | Builds `.ics` artifact from `date:` front-matter |

---

## Project Structure

```
milo/
├── goals/           # Workflow definitions (post tweets, monitor engagement)
├── tools/x/         # Deterministic X API scripts (post, search, engage, analytics)
├── 2Brain/          # Notes with front-matter (date:, status:, description:)
├── MiloKan/         # Kanban board generator + output
├── calendar_sync.sh # .ics generator from 2Brain/ dates
├── Claude/          # GOTCHA Framework system handbook
└── .github/workflows/
    ├── milo-kanban.yml
    └── calendar_sync.yml
```

---

## Adding Content

Create a note in `2Brain/` with front-matter to get it on the Kanban board and calendar:

```markdown
---
title: My Task
date: 2026-03-15
status: backlog
description: Short summary
---

# My Task
Details here...
```

**Status values:** `backlog`, `in_progress`, `done`
