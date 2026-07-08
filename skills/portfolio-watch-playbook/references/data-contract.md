# Data Contract

Every generated Portfolio Watch Playbook must be backed by feed outputs. The
HTML, README, and alerts should describe only outputs that the feed actually
writes and verifies.

## Required Outputs

### `portfolio/summary`

One latest portfolio snapshot.

Required fields:

- `universe` - comma-separated symbols.
- `weighting` - weighting assumption or source.
- `benchmark` - benchmark symbol or empty string.
- `asOf` - latest source timestamp.
- `tickerCount` - number of working symbols.
- `portfolioIndex` - normalized portfolio index.
- `return1d`, `return1w`, `return1m` - weighted returns in percent.
- `attentionCount` - number of medium/high signals.
- `highSignalCount` - number of high-severity signals.
- `riskState` - user-facing state such as `Normal`, `Watch`, or `Alert`.
- `missingSymbols` - comma-separated failed symbols, if any.

### `portfolio/equity`

Time series for the normalized portfolio path.

Required fields:

- `portfolioIndex`
- `benchmarkIndex` when benchmark data is available.
- `constituentCount`

### `watch/assets`

One latest row per working symbol.

Required fields:

- `symbol`, `name`, `sector`, `industry`, `asOf`
- `watchWeightPct`
- `close`, `volume`
- `return1d`, `return1w`, `return1m`
- `benchmarkReturn1d`
- `relativeReturn1d`
- `medianAbsReturn60d`
- `volumeRatio20d`
- `rsi14`, `ma20`, `ma60`, `ma20DistancePct`
- `peRatio`, `marketCap`
- `attentionScore`, `severity`, `state`

### `history/prices`

Daily rows for charting.

Required fields:

- `symbol`
- `close`
- `normalized`
- `volume`

### `signals/events`

All attention-ranked signal candidates, including medium and low severity.

Required fields:

- `signalId`
- `symbol`
- `severity`
- `score`
- `title`
- `reason`
- `evidence`
- `triggerType`
- `portfolioImpactPct`
- `metricValue`
- `baseline`
- `asOf`
- `dedupKey`
- `deepLinkAnchor`

### `alerts/events`

Events eligible for user interruption in the current run. Usually this is the
high-severity subset of `signals/events`.

Required fields:

- `signalId`
- `symbol`
- `severity`
- `title`
- `body`
- `portfolioImpactPct`
- `triggerType`
- `asOf`
- `dedupKey`
- `deepLinkAnchor`
- `deliveryState` - `candidate`, `quiet`, or `sent` when verifiable.

### `alerts/decision`

One latest human-readable notification decision for the current run. This is
the primary source for the Playbook's first screen.

Required fields:

- `notificationState` - `quiet`, `watch`, `sent`, or `setup`.
- `decisionTitle` - plain user-facing conclusion, such as `No ping sent`.
- `decisionBody` - one or two sentences explaining the decision.
- `topSignalId` - top signal id, or empty string when no signal exists.
- `topSymbol` - symbol driving the decision, or `PORTFOLIO`.
- `topSeverity` - top signal severity, or `quiet`.
- `quietReason` - `below_threshold`, `duplicate`, `no_signal`, `missing_data`,
  or empty string when a market notification was sent. For setup confirmation,
  use the current non-market reason such as `no_signal` or `below_threshold`.
- `nextAction` - what the user should do next, such as `No action needed` or
  `Open GOOGL detail`.
- `nextTrigger` - short threshold explanation for the next notification.
- `score`
- `threshold`
- `portfolioImpactPct`
- `asOf`
- `deepLinkAnchor`
- `cooldownDays`

### `notify/message`

Alva push sidecar. Write exactly one row per run.

Required fields:

- `title`
- `body`

When no high-severity event exists and no first-subscription setup
confirmation was explicitly requested, `body` must contain
`<|SKIP_NOTIFICATION|>`.

## Data Rules

- Use Data Skills, released feeds, or validated BYOD for all financial values.
- Fetch current Data Skills endpoint docs before writing calls.
- Use the feed as the single source of truth for HTML, README, and alerts.
- Keep signal reasons short and evidence-backed.
- Keep `alerts/decision` plain-language and user-facing. The page must not
  require users to translate severity bands, score thresholds, or quiet audit
  rows to understand the current state.
- Store assumptions explicitly: weights, benchmark, cadence, missing coverage,
  and sensitivity.
