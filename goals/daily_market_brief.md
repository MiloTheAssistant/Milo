# Goal: Daily Market Brief

## Objective
Produce a DAILY MARKET BRIEF published at 8:45AM America/Chicago.
Fetch live RSS feeds, deduplicate stories, and output the brief using the exact template below.

---

## Inputs
Four RSS feeds — fetch all four every run:

1. **Yahoo Finance Top Stories**: `https://finance.yahoo.com/news/rssindex`
2. **Yahoo Finance Crypto**: `https://finance.yahoo.com/topic/crypto/rss/`
3. **Yahoo AI & Automation**: `https://news.search.yahoo.com/rss?p=(artificial%20intelligence%20OR%20AI%20automation%20OR%20machine%20learning)`
4. **Yahoo MAG7 + PLTR**: `https://news.search.yahoo.com/rss?p=(AAPL%20OR%20MSFT%20OR%20GOOGL%20OR%20AMZN%20OR%20META%20OR%20NVDA%20OR%20TSLA%20OR%20PLTR)`

---

## Rules
- Read the most recent items from each feed. Target last 24 hours; prioritize the latest 8 hours.
- Deduplicate stories across feeds (same headline or same canonical URL = one story).
- Prefer Yahoo Finance RSS (feed 1) for overall market narrative and "Market Movers".
- Keep output concise: 2–3 bullet headlines per news section, plus a 1-line "why it matters" for each.
- If price data is not available from feeds, use placeholder ($XX,XXX) — never invent numbers.
- Tone: executive brief. No hype. No emojis in the brief itself.

---

## Output Template
Fill every field. Use placeholders for any unavailable data. Do not add extra sections.

```
DAILY MARKET BRIEF - [YYYY-MM-DD] (8:45AM CST)

CRYPTO MARKETS
• Bitcoin: $XX,XXX (±X%)
• Ethereum: $X,XXX (±X%)
• Market sentiment: [CoinGecko trending placeholder if not available: "Sentiment: Mixed"]

AI & AUTOMATION NEWS
• [Headline] — [Why it matters in one line]
• [Headline] — [Why it matters in one line]
• [Headline] — [Why it matters in one line]

MAG7 & KEY STOCKS
• AAPL: $XXX (±X%) | MSFT: $XXX (±X%) | GOOGL: $XXX (±X%)
• AMZN: $XXX (±X%) | META: $XXX (±X%) | NVDA: $XXX (±X%) | TSLA: $XXX (±X%)
• PLTR: $XXX (±X%)
• Notable moves/news:
  - [Headline] — [Why it matters]
  - [Headline] — [Why it matters]

BROADER MARKET
• S&P 500: X,XXX (±X%) | Nasdaq: XX,XXX (±X%) | Dow: XX,XXX (±X%)
• Gold: $X,XXX/oz (±X%) | Silver: $XX/oz (±X%)
• WTI Crude: $XX/bbl (±X%) | Brent: $XX/bbl (±X%)

MARKET MOVERS (from Yahoo Finance RSS)
• [Top story] — [Why it matters]
• [Top story] — [Why it matters]
• [Top story] — [Why it matters]
```

---

## Edge Cases
- If a feed is unreachable, note it as "Feed unavailable" in the relevant section and continue.
- If fewer than 2 stories exist for a section, use what's available — do not pad with stale content.
- Never fabricate prices or move percentages. Placeholders only.
