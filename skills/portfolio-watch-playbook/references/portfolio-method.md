# Portfolio Method

Use this method to turn an arbitrary user watchlist or portfolio into an
attention-triage Playbook. The goal is not to recommend trades; the goal is to
show which holdings deserve attention now, why, and whether the user should be
interrupted.

The product output is a visual portfolio read, not a score report. Scores,
severity bands, and indicators are implementation details that support two
plain-language answers: what is important to inspect, and what is important
enough to interrupt the user.

## Inputs

- Required: ticker list, watchlist, holdings, or connected-account portfolio.
- Optional: weights, benchmark, market, cadence, alert sensitivity, cost basis,
  and thesis notes.
- Default v1 market: US equities.
- Default weights: user-provided weights if present; otherwise equal-weight
  watch weights.

## Attention Model

Rank signals by five concepts:

1. **Abnormality** - Is the move unusual for this asset relative to its own
   recent behavior, benchmark, sector, or peer context?
2. **Portfolio relevance** - Does the move matter to the user's portfolio
   exposure? Portfolio impact must dominate raw price move size.
3. **Explainability** - Can the Playbook state a clear reason and evidence path
   for why this deserves attention?
4. **Freshness** - Is the signal based on current data for the configured
   cadence?
5. **Novelty** - Has the user already been alerted to the same issue recently?

Use exact scoring weights as implementation details. The required ranking
principle is:

`attention = abnormality + portfolio relevance + explainability + freshness - repeated noise`

Portfolio relevance and abnormality must dominate ranking. News, options,
social, macro, and analyst catalysts may boost severity when sourced, but they
must not replace structured market evidence.

## Watched Dimensions

Required v1 dimensions:

- Price action: latest close, 1D, 1W, 1M return, normalized path.
- Relative performance: return versus the chosen benchmark when available.
- Volatility / noise: latest move versus recent median absolute daily move, and
  latest intraday range versus recent range when high/low data is available.
- Volume: today's volume versus recent median volume when available.
- Trend: MA20, MA60, close-vs-MA20 distance, close-vs-MA60 distance, and trend
  stretch.
- Stretch: RSI 14 overbought / oversold state.
- Portfolio impact: ticker return multiplied by watch or holding weight.
- Context: company name, sector, industry, market cap, trailing P/E when
  available.

Optional dimensions when coverage is verified:

- News / filings / earnings / ratings as catalysts.
- Options activity as a booster.
- Twitter/X or social signals as a booster.
- Macro data as portfolio-level context.

## Severity Guidance

- **High**: material portfolio impact, abnormal move, fresh data, clear reason,
  and no recent duplicate. Eligible for push.
- **Medium**: noteworthy but missing one high-severity gate. Show in Playbook,
  do not push.
- **Low**: context only. Show in holdings/detail views, do not push.

Never rank only by largest percentage move. A smaller move in a large weight
can outrank a larger move in a small weight. A volatile stock's ordinary move
should not outrank a quiet stock's true anomaly.

Technical analysis should read as `price + volume + trend + volatility`, not a
raw indicator dump. Price abnormality and portfolio impact carry the alert bar.
Volume, trend, and volatility explain whether the move is confirmed or noisy;
they should not make a volume-only event high severity by themselves.

## Visual Guidance

Start with the normalized portfolio path, then let users choose constituent and
benchmark context. The user should be able to inspect:

- The whole portfolio versus SPY and QQQ.
- One ticker at a time.
- Several tickers together when comparing drivers.

The chart is for macro orientation. The attention list explains what is worth
reading. The alert decision explains whether any signal was worth interrupting
the user. Keep these three jobs separate.

## Decision Guidance

Every run must produce one user-facing decision:

- **Sent**: a fresh, non-duplicate high signal triggered a notification.
- **Watch**: the top signal is medium severity or close to the alert bar, but
  not worth interrupting the user.
- **Quiet**: no material signal, or a high signal was suppressed as a duplicate.

The decision should say what happened, why it did or did not clear the alert
bar, and what the user should do next.

## Failure Behavior

- If one or more symbols fail and the failure rate is <= 20%, continue with the
  working symbols and document the missing symbols in README blind spots.
- If more than 20% fail, stop and request corrected symbols or BYOD.
- If a metric needed for one signal type is missing, omit that signal type for
  the affected asset and lower confidence. Do not invent baselines.
- Do not fabricate prices, metrics, weights, company names, signal events, or
  alert history.
