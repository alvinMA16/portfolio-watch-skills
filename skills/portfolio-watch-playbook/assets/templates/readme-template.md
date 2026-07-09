# REPLACE_DISPLAY_NAME

This Playbook watches `REPLACE_UNIVERSE` as a portfolio attention surface. It is
designed to answer `Anything big?` with a simple red/yellow/green result, which
holdings deserve attention, why, and whether the change is important enough to
notify the user.

It monitors price action, volume, trend, volatility, portfolio impact, and
SPY/QQQ context. It does not claim to monitor news, earnings, analyst revisions,
or company catalysts unless those sources are explicitly listed below.

## Inputs and assumptions

- Universe: `REPLACE_UNIVERSE`
- Weights: `REPLACE_WEIGHTING_ASSUMPTION`
- Benchmark: `REPLACE_BENCHMARK`
- Chart benchmarks: `SPY`, `QQQ` when available from the deployed feed.
- Refresh cadence: `REPLACE_CADENCE`
- Alert sensitivity: `REPLACE_ALERT_SENSITIVITY`
- Cost basis / realized P&L: `REPLACE_COST_BASIS_ASSUMPTION`

If weights were not provided, the Playbook uses equal-weight watch weights. The
weights are monitoring weights, not a verified brokerage position, unless the
user explicitly connected an account or supplied holdings.

## Data sources and freshness

Replace this section with only sources actually called and deployed:

- Arrays stock kline for daily close, volume, and normalized price paths.
- Arrays stock kline high/low/close/volume fields for price, volume, and
  volatility states.
- Arrays stock market metrics for RSI, moving averages, P/E, and market cap
  when available.
- Arrays company detail for company name, sector, and industry.
- This generated version should list news, earnings, analyst revisions,
  company catalysts, options, or social signals only when they are explicitly
  wired.

The Playbook reads feed outputs at runtime. Financial values are not embedded in
the HTML.

## First-screen answer

The first screen starts with `Anything big?`, which answers:

- `Green / 无需关注`: current data shows nothing worth checking.
- `Yellow / 留意一下`: something is worth a look, but not urgent.
- `Red / 请立即关注`: a major change crossed the interruption bar.
- One row per holding with 1D move, relative move versus SPY, volume ratio, and
  portfolio impact.
- The top one or two evidence-backed changes worth inspecting.
- A compact last-checked timestamp.

The portfolio trend chart sits directly below the Anything Big region as the
next evidence layer.

## Visual exploration

The chart is the evidence layer for the status answer. It shows the normalized
portfolio path and lets the user switch between:

- Portfolio: whole portfolio versus available benchmarks.
- Tickers: one holding at a time, with optional benchmark overlays.
- Compare: several holdings together, prioritized by attention score and
  watch weight.

SPY and QQQ are generated as benchmark series when coverage is available. The
primary benchmark for relative-move scoring is `REPLACE_BENCHMARK` unless the
generated build states otherwise.

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

Technical context is summarized as four states:

- Price: latest move versus the asset's own recent noise and the selected
  benchmark.
- Volume: latest volume versus the recent median.
- Trend: close versus MA20/MA60 plus RSI stretch.
- Volatility: latest move and intraday range versus recent norms.

Price abnormality is the main trigger. Volume, trend, and volatility confirm or
qualify the move; a volume-only event should not become high severity by itself.

The Playbook separates two decisions:

- Worth seeing in the Playbook: usually `Yellow / 留意一下`.
- Worth interrupting the user: only `Red / 请立即关注`.

A yellow signal can be useful context without being pushed to the user.

## Status bands

- Red / 请立即关注: material enough to interrupt, fresh, explainable, and not a
  duplicate.
- Yellow / 留意一下: worth reading in the Playbook, but not urgent.
- Green / 无需关注: no meaningful change in the wired data.

## Alert policy

Alerts are quiet by default.

- Only red signals are pushed.
- Yellow and green signals stay in the Playbook.
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

- Anything Big Status: the first-screen answer to whether anything needs
  attention, backed by concrete holding-level values.
- Portfolio Trend: chart evidence for portfolio, holdings, SPY, and QQQ when
  available.
- Today queue: ranked events that deserve inspection.
- Evidence explanation: what was observed and what is not wired.
- Holdings State: all symbols, including non-alerting names.
- Notification audit: why a ping was or was not sent.
- Current capability: what the Playbook checks and what it does not check.

## Blind spots

Replace this section with actual limits from the generated build:

- Missing symbols: `REPLACE_MISSING_SYMBOLS`
- Missing benchmark series: `REPLACE_MISSING_BENCHMARKS`
- Data coverage limits: `REPLACE_DATA_LIMITS`
- Cadence limits: `REPLACE_CADENCE_LIMITS`
- Account/P&L limits: `REPLACE_ACCOUNT_LIMITS`
- Decision limits: the alert decision only uses data sources listed above. If
  news, options, social, analyst, or account data is not wired, it cannot
  affect notification decisions.

This Playbook is for research and monitoring. It is not investment advice and
does not execute trades.
