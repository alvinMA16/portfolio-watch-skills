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
- `benchmarks` - comma-separated available benchmark symbols, such as
  `SPY,QQQ`.
- `asOf` - latest source timestamp.
- `tickerCount` - number of working symbols.
- `portfolioIndex` - normalized portfolio index.
- `return1d`, `return1w`, `return1m` - weighted returns in percent.
- `attentionCount` - number of medium/high signals.
- `highSignalCount` - number of raw high-severity signals kept for backward
  compatibility; user-facing alert eligibility is `redSignalCount`.
- `redSignalCount` - number of holdings with `请立即关注` status.
- `yellowSignalCount` - number of holdings with `留意一下` status.
- `riskState` - user-facing state such as `Normal`, `Watch`, or `Alert`.
- `bigStatusColor` - `green`, `yellow`, or `red` for the first-screen answer.
- `bigStatusLabel` - localized status label, such as `无需关注`, `留意一下`,
  or `请立即关注`.
- `bigStatusBody` - one plain-language sentence explaining the answer.
- `portfolioScope` - plain-language read on whether the issue is single-name or
  portfolio-wide.
- `missingSymbols` - comma-separated failed symbols, if any.
- `missingBenchmarks` - comma-separated failed benchmark lookups, if any.

### `portfolio/equity`

Time series for the normalized portfolio path. Keep this output for backward
compatibility; new chart views should read `chart/series`.

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
- `volumeRatio20d`, `moveVsNormal`, `rangeRatio20d`
- `rsi14`, `ma20`, `ma60`, `ma20DistancePct`, `ma60DistancePct`
- `peRatio`, `marketCap`
- `attentionScore`, `technicalScore`, `portfolioImpactPct`,
  `primaryTechnicalDriver`
- `technicalSummary`
- `priceState`, `volumeState`, `trendState`, `volatilityState`
- `reviewColor`, `reviewLabel`, `reviewReason`
- `portfolioScope`, `confirmationStatus`
- `severity`, `state`

### `history/prices`

Daily ticker rows for charting. Keep this output for backward compatibility;
new chart views should read `chart/series`.

Required fields:

- `symbol`
- `close`
- `normalized`
- `volume`

### `chart/series`

Unified normalized time series for the visual-first chart surface.

Required fields:

- `seriesType` - `portfolio`, `holding`, or `benchmark`.
- `symbol` - `PORTFOLIO`, a ticker symbol, or benchmark symbol such as `SPY`.
- `label` - user-facing series label.
- `date`
- `normalized`
- `close` when available.
- `weightPct` for holding series when available.

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
- `technicalSummary`
- `triggerType`
- `primaryTechnicalDriver`
- `priceState`, `volumeState`, `trendState`, `volatilityState`
- `reviewColor`, `reviewLabel`, `reviewReason`
- `portfolioScope`, `confirmationStatus`
- `evidencePresent`, `evidenceMissing`
- `portfolioImpactPct`
- `metricValue`
- `baseline`
- `asOf`
- `dedupKey`
- `deepLinkAnchor`

### `alerts/events`

Events eligible for user interruption in the current run. Usually this is the
`Red / 请立即关注` subset of `signals/events`.

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
- `bigStatusColor`, `bigStatusLabel`, `bigStatusBody` - first-screen
  red/yellow/green answer in user language.
- `portfolioScope` - whether the current issue is single-holding or
  portfolio-wide.
- `notificationAudit` - why a push was or was not sent.
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

When no red event exists and no first-subscription setup
confirmation was explicitly requested, `body` must contain
`<|SKIP_NOTIFICATION|>`.

### `capability/status`

One latest row describing what the current build actually checks.

Required fields:

- `checkedItems` - comma-separated or sentence-style list of wired inputs.
- `notCheckedItems` - list of important inputs that are not wired.
- `decisionLimit` - plain-language statement that the Playbook will not claim
  conclusions from unwired data.

## Data Rules

- Use Data Skills, released feeds, or validated BYOD for all financial values.
- Fetch current Data Skills endpoint docs before writing calls.
- Use the feed as the single source of truth for HTML, README, and alerts.
- Generate chart series for the portfolio, each working holding, and available
  SPY / QQQ benchmarks. Do not render unavailable benchmark controls.
- Technical analysis must expose price, volume, trend, and volatility states as
  structured fields. Price abnormality remains the main trigger; volume, trend,
  and volatility should confirm, contextualize, or weaken the signal.
- Keep signal reasons short and evidence-backed. User-facing reasons should
  include concrete values such as 1D return, relative return, volume ratio, and
  portfolio impact instead of generic "worth a look" phrasing.
- Keep `alerts/decision` plain-language and user-facing. The page must not
  require users to translate severity bands, score thresholds, or quiet audit
  rows to understand the current state.
- Do not expose internal terms such as `gate`, `review candidate`, or
  `portfolio risk elevated` as the primary UI answer. Use the red/yellow/green
  labels and explain them in ordinary language.
- Do not claim news, earnings, analyst revisions, company catalysts, or thesis
  drivers are monitored unless a feed output is actually backed by those
  sources. Put unwired sources in `capability/status.notCheckedItems`.
- Store assumptions explicitly: weights, benchmark, cadence, missing coverage,
  and sensitivity.
