# Portfolio Method

Use this method to turn an arbitrary user watchlist or portfolio into an
attention-triage Playbook. The goal is not to recommend trades; the goal is to
show which holdings deserve attention now, why, and whether the user should be
interrupted.

The product output is a visual portfolio read, not a score report. Scores,
severity bands, and indicators are implementation details that support one
plain-language answer: **Anything big?** The user-facing answer must use
localized green/yellow/red labels, not raw scores or internal alert mechanics.
For English output, use plain labels such as `No need to watch`, `Keep an eye
on it`, and `Look now`. For Chinese output, use `无需关注`, `留意一下`, and
`请立即关注`.

## Inputs

- Required: ticker list, watchlist, holdings, or connected-account portfolio.
- Optional: weights, benchmark, market, cadence, alert sensitivity, cost basis,
  and thesis notes.
- Default v1 market: US equities.
- Default weights: user-provided weights if present; otherwise equal-weight
  watch weights.

## Attention Model

Rank signals by six concepts:

1. **Abnormality** - Is the move unusual for this asset relative to its own
   recent behavior, benchmark, sector, or peer context?
2. **Portfolio relevance** - Does the move matter to the user's portfolio
   exposure? Portfolio impact must dominate raw price move size.
3. **Explainability** - Can the Playbook state a clear reason and evidence path
   for why this deserves attention?
4. **Event context** - Is there sourced news, earnings, analyst, or catalyst
   context that helps explain the move?
5. **Freshness** - Is the signal based on current data for the configured
   cadence?
6. **Novelty** - Has the user already been alerted to the same issue recently?

Use exact scoring weights as implementation details. The required ranking
principle is:

`attention = abnormality + portfolio relevance + explainability + sourced context + freshness - repeated noise`

Portfolio relevance and abnormality must dominate ranking. News, earnings,
analyst changes, options, social, macro, and company catalysts may boost
severity only when sourced. If they are not wired or the current run cannot
fetch them, explicitly say they are not checked; do not imply a thesis or
catalyst change from price action alone.

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

Default event-context dimensions when coverage is verified:

- Recent symbol-filtered market news.
- Recent and upcoming earnings calendar dates.
- Recent analyst price-target news and consensus estimate changes.

Optional dimensions when coverage is verified:

- SEC earnings releases, earnings transcripts, filings, and deeper guidance
  parsing.
- Options activity as a booster.
- Twitter/X or social signals as a booster.
- Macro data as portfolio-level context.

## Severity Guidance

Internal severity can still use `high`, `medium`, and `low` for scoring and
backward compatibility, but the Playbook must translate it before showing it to
users:

- **Red / urgent**: material portfolio impact, abnormal move, fresh data, clear
  reason, and either sourced event confirmation or an unusually large portfolio
  impact. Eligible for push. Localize as `Look now` in English or `请立即关注` in
  Chinese.
- **Yellow / watch**: noteworthy but not urgent. This includes abnormal
  price/portfolio moves without event confirmation, or sourced event context
  that is worth reading but not enough to interrupt the user. Localize as
  `Keep an eye on it` in English or `留意一下` in Chinese.
- **Green / quiet**: context only. Localize as `No need to watch` in English or
  `无需关注` in Chinese.

Never rank only by largest percentage move. A smaller move in a large weight
can outrank a larger move in a small weight. A volatile stock's ordinary move
should not outrank a quiet stock's true anomaly.

Technical analysis should read as `price + volume + trend + volatility`, not a
raw indicator dump. Price abnormality and portfolio impact carry the alert bar.
Volume, trend, volatility, and event context explain whether the move is
confirmed or noisy; they should not make a volume-only or headline-only event
high severity by themselves.

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

- **Red / urgent**: a fresh, non-duplicate, material event triggered or would
  trigger a notification.
- **Yellow / watch**: a change is worth reading in the Playbook, but does not
  justify immediate interruption.
- **Green / quiet**: no meaningful change in wired data.

The decision should say what happened, whether a sourced event was found nearby,
why it did or did not clear the alert bar, whether it looks like one holding or
the whole portfolio, and what the user should do next.

## Failure Behavior

- If one or more symbols fail and the failure rate is <= 20%, continue with the
  working symbols and document the missing symbols in README blind spots.
- If more than 20% fail, stop and request corrected symbols or BYOD.
- If a metric needed for one signal type is missing, omit that signal type for
  the affected asset and lower confidence. Do not invent baselines.
- Do not fabricate prices, metrics, weights, company names, signal events, or
  alert history.
