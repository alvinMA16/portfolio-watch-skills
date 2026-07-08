# REPLACE_DISPLAY_NAME

This Playbook watches `REPLACE_UNIVERSE` as a portfolio attention surface. It is
designed to answer: which holdings deserve attention now, why, and whether the
change is important enough to notify the user.

## Inputs and assumptions

- Universe: `REPLACE_UNIVERSE`
- Weights: `REPLACE_WEIGHTING_ASSUMPTION`
- Benchmark: `REPLACE_BENCHMARK`
- Refresh cadence: `REPLACE_CADENCE`
- Alert sensitivity: `REPLACE_ALERT_SENSITIVITY`
- Cost basis / realized P&L: `REPLACE_COST_BASIS_ASSUMPTION`

If weights were not provided, the Playbook uses equal-weight watch weights. The
weights are monitoring weights, not a verified brokerage position, unless the
user explicitly connected an account or supplied holdings.

## Data sources and freshness

Replace this section with only sources actually called and deployed:

- Arrays stock kline for daily close, volume, and normalized price paths.
- Arrays stock market metrics for RSI, moving averages, P/E, and market cap
  when available.
- Arrays company detail for company name, sector, and industry.
- Optional validated sources for news, earnings, analyst revisions, options, or
  social signals when explicitly wired.

The Playbook reads feed outputs at runtime. Financial values are not embedded in
the HTML.

## Attention methodology

The Playbook ranks attention signals using five concepts:

1. Abnormality: whether the move is unusual for the asset.
2. Portfolio relevance: whether it matters to the user's watch weights or
   holdings.
3. Explainability: whether the signal has a clear evidence path.
4. Freshness: whether the data is current for the configured cadence.
5. Novelty: whether the user has already been alerted to the same condition.

Portfolio impact and abnormality dominate ranking. Catalysts such as news,
ratings, options activity, social data, or macro context can boost severity only
when the source is actually wired and verified.

## Signal bands

- High: material portfolio impact, abnormal move, fresh data, clear reason, and
  no recent duplicate. Eligible for push notification.
- Medium: noteworthy but missing one high-severity gate. Displayed in the
  Playbook, not pushed.
- Low: context only. Displayed in the holdings and detail views, not pushed.

## Alert policy

Alerts are quiet by default.

- Only high-severity signals are pushed.
- Medium and low signals stay in the Playbook.
- Quiet runs write `<|SKIP_NOTIFICATION|>` instead of sending a heartbeat.
- After the first successful subscription, the automation sends one setup
  confirmation to prove delivery works. This is not a market signal and should
  not repeat on later quiet runs.
- Each alert links to the matching signal detail in the Playbook.
- Repeated alerts with the same deduplication key should be suppressed during
  the configured cool-down window when alert history is available.

## Alert decision surface

The first screen is driven by `alerts/decision`, a single row that explains the
current notification decision in plain language:

- Whether a notification was sent, skipped, or held at watch level.
- Whether a one-time setup confirmation was sent after first subscription.
- The top symbol or portfolio condition behind that decision.
- Why the signal did or did not clear the alert bar.
- What the user should do next.
- What would need to happen before the next notification is sent.

This keeps the Playbook from forcing users to translate severity bands, score
thresholds, or repeated quiet audit rows.

## Interface

The Playbook contains:

- Overview: portfolio state, returns, signal counts, assumptions.
- Signal Queue: ranked attention events.
- Signal Detail: evidence and reasoning for each signal.
- Holdings State: all symbols, including non-alerting names.
- Charts: portfolio and constituent paths from feed outputs.
- Alert History: recent high-severity or quiet alert audit rows.
- Alert Decision: the plain-language notification decision for the current
  run.

## Blind spots

Replace this section with actual limits from the generated build:

- Missing symbols: `REPLACE_MISSING_SYMBOLS`
- Data coverage limits: `REPLACE_DATA_LIMITS`
- Cadence limits: `REPLACE_CADENCE_LIMITS`
- Account/P&L limits: `REPLACE_ACCOUNT_LIMITS`
- Decision limits: the alert decision only uses data sources listed above. If
  news, options, social, analyst, or account data is not wired, it cannot
  affect notification decisions.

This Playbook is for research and monitoring. It is not investment advice and
does not execute trades.
