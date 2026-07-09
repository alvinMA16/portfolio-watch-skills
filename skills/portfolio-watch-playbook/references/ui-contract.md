# UI Contract

Build the Playbook as a status-first portfolio watch surface, not a generic
stock table or notification log. The first viewport should explain what the
Playbook monitors, answer `Anything big?` with a red/yellow/green result, show
what changed by holding with concrete values, and put the portfolio chart
directly below as evidence.

## Required Views

## Anything Big Status

This is the first useful region in the iframe. It reads `alerts/decision`,
`signals/events`, `watch/assets`, and `portfolio/summary`.

Show a compact decision surface:

- Main question: `Anything big?`
- One-sentence product explanation: this Playbook monitors price moves, volume,
  trend, volatility, portfolio impact, and SPY/QQQ context.
- Status:
  - `Green / 无需关注`: 当前没有值得你查看的变化。
  - `Yellow / 留意一下`: 有变化值得看看，但还不到需要立刻处理。
  - `Red / 请立即关注`: 有重大变化，建议现在查看。
- Holding answers: one row per working holding using the same labels and
  showing 1D return, relative return versus SPY, volume ratio, and portfolio
  impact.
- Top changes: one or two evidence-backed lines that explain what is worth
  opening now or later.
- Last checked should be a small timestamp, not a content block.

Place the chart directly below the Anything Big region on desktop and mobile.
Do not let KPI cards, alert history, raw scores, internal mechanism words,
empty "why" fields, or generic "worth a look" copy crowd out this answer.

## Portfolio Trend

This is the immediate evidence layer for the status answer.

Show one large chart driven by `chart/series` with these controls:

- A prominent top control bar split into `View`, `Range`, and `Benchmark`
  groups.
- Segmented view tabs: `Portfolio`, `Tickers`, and `Compare`.
- Segmented range tabs: `1M`, `3M`, `6M`, and `All`.
- Benchmark checkboxes for `SPY` and `QQQ` when their series exist.
- Ticker checkboxes for the `Tickers` and `Compare` tabs.

Default behavior:

- `Portfolio` shows the normalized portfolio path plus available benchmarks.
- `Range` defaults to `3M`. This is the watch default because it shows recent
  portfolio behavior without letting long history dilute the current move.
- `Tickers` shows the highest-attention ticker by default. If no signal exists,
  select the first working holding.
- `Compare` shows up to five holding curves, prioritized by attention score and
  then watch weight. Users can change the selection.
- Missing benchmark series must disable or hide the matching checkbox. Do not
  render an empty curve.

Keep controls compact and make the control groups visibly actionable without
scattering them around the chart. Time ranges should filter `chart/series` in
the browser and rebase each visible line to 100 at the start of the selected
range. Make the next section visible below the fold when possible.

## 今天要看什么

Show `signals/events` sorted by the red/yellow/green user result, not by raw
score or alert eligibility alone.
Each row/card must include:

- Symbol and title.
- User status label: `无需关注`, `留意一下`, or `请立即关注`.
- Short reason in ordinary language with concrete values: 1D move, relative move
  versus SPY, volume ratio, and portfolio impact when available.
- Four evidence chips: price, volume, trend, and volatility.
- Portfolio impact.
- Evidence summary.
- Link target matching `deepLinkAnchor`.
- Whether the signal is worth checking today or now.

Yellow signals can be important to inspect without being worth a phone alert.
Use plain sentences such as:

`TSLA 有变化值得看看，但还不到需要立刻处理。`

## Ping Status

Show `alerts/decision` through the Portfolio Attention Status panel, not as a
separate notification log:

- Notification state: `quiet`, `watch`, `sent`, or `setup`.
- Human conclusion, such as `无需关注`, `留意一下`, or `请立即关注`.
- Reason in one or two evidence-backed sentences.
- Next action, such as `No action needed` or `Open GOOGL detail`.
- Link target matching `deepLinkAnchor` when a signal exists.

When state is `setup`, make clear that the user received a one-time
subscription confirmation and that no market signal is being claimed.

Do not make the user infer notification behavior from score, severity,
thresholds, or repeated quiet rows. Also do not imply that "留意一下" always
means "worth alerting."

## Overview

Show the current portfolio state:

- Portfolio risk state.
- Latest as-of timestamp.
- Portfolio 1D / 1W / 1M returns.
- High and medium signal counts.
- Weighting and benchmark assumptions.

## 证据明细

Each signal must have a stable anchor such as `#signal-<signalId>` so alerts can
open the matching detail. The detail should show:

- What happened.
- Why it is abnormal across price, volume, trend, and volatility.
- Why it matters to the portfolio.
- Evidence present.
- Evidence missing, especially unwired sources such as news, earnings, analyst
  revisions, company catalysts, or thesis drivers.
- Source timestamp.
- Data blind spots.

## Holdings Table

Show all working symbols, including non-alerting names:

- Symbol, company, weight.
- Close, 1D, 1W, 1M.
- Relative return.
- User status label.
- Plain-language reason.
- Short evidence state, including price and volume.

## History / Charts

Use `chart/series` as the source of truth for normalized portfolio, benchmark,
and constituent paths. Use runtime feed reads only. Do not inline chart data.

## 为什么没通知你

Show latest `alerts/events` records or a quiet state. Collapse repeated quiet
runs into one summary such as `Last 3 runs quiet`; do not render multiple
quiet rows as separate alert cards. This ties phone alerts back to the
interface without creating noise.

## 当前在看什么

Show `capability/status` so the Playbook is honest about its scope:

- Already wired inputs, such as price, volume, trend, volatility, portfolio
  impact, and SPY/QQQ context.
- Not wired inputs, such as news, earnings, analyst revisions, company
  catalysts, or thesis drivers.
- A short limitation statement that the Playbook does not draw conclusions from
  unwired data.

## Interaction Rules

- Use Alva design-system CSS.
- Use `AlvaToolkit.AlvaClient` for runtime reads.
- Avoid duplicate outer Playbook chrome in the iframe.
- Keep all visible financial values sourced from feed outputs.
- Make the first screen status-first with the chart as immediate evidence. Do
  not let KPI cards or alert history crowd out the attention answer.
- Make empty and partial-data states honest: show missing symbols and blind
  spots instead of placeholder values.
- Do not show `Portfolio risk elevated`, `review candidate`, `gate`, raw
  severity, or score bands as the first-screen answer.
- Follow the user's preferred language for visible UI copy. Keep ticker symbols
  and market abbreviations unchanged.
