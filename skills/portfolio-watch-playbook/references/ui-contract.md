# UI Contract

Build the Playbook as a status-first portfolio watch surface, not a generic
stock table or notification log. The first viewport should answer: do you need
to review anything now, what changed by holding, why that is or is not worth
attention, when the monitor last checked, what it is watching next, and what
chart evidence supports the answer.

## Required Views

## Portfolio Attention Status

This is the first useful region in the iframe. It reads `alerts/decision`,
`signals/events`, `watch/assets`, and `portfolio/summary`.

Show a compact decision surface:

- Main question: `Do you need to review anything now?`
- Overall status:
  - `Green`: `No urgent review needed`.
  - `Yellow`: `Digest-worthy changes`.
  - `Red`: `Review trigger fired`.
- Today's answer: one row per working holding, such as `Review now`,
  `Digest-worthy`, `Logged only`, or `No review needed`.
- Why: one evidence-backed sentence from the current decision.
- Last checked: latest source timestamp.
- Next watch: the next condition to monitor. Do not invent future catalysts;
  if no event source is wired, write a condition-based trigger.

On desktop, place this status panel beside the portfolio trend chart. On mobile,
show this panel first and the chart immediately after it. Do not let KPI cards,
alert history, or raw scores crowd out this answer.

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

## What Matters Now

Show `signals/events` sorted by user attention, not by alert eligibility alone.
Each row/card must include:

- Symbol and title.
- Severity.
- Short reason.
- Four technical state chips: price, volume, trend, and volatility.
- Technical summary in plain language.
- Portfolio impact.
- Evidence summary.
- Link target matching `deepLinkAnchor`.
- Whether the signal is worth inspecting only, or also cleared the alert bar.

Medium signals can be important to inspect without being worth a phone alert.
Use plain sentences such as:

`GOOGL moved more than usual, but portfolio impact stayed below the alert bar.`

## Ping Status

Show `alerts/decision` through the Portfolio Attention Status panel, not as a
separate notification log:

- Notification state: `quiet`, `watch`, `sent`, or `setup`.
- Human conclusion, such as `No ping sent` or `Ping sent for GOOGL`.
- Reason in one or two evidence-backed sentences.
- Next action, such as `No action needed` or `Open GOOGL detail`.
- Link target matching `deepLinkAnchor` when a signal exists.

When state is `setup`, make clear that the user received a one-time
subscription confirmation and that no market signal is being claimed.

Do not make the user infer notification behavior from score, severity,
thresholds, or repeated quiet rows. Also do not imply that "important to inspect"
always means "worth alerting."

## Overview

Show the current portfolio state:

- Portfolio risk state.
- Latest as-of timestamp.
- Portfolio 1D / 1W / 1M returns.
- High and medium signal counts.
- Weighting and benchmark assumptions.

## Signal Detail

Each signal must have a stable anchor such as `#signal-<signalId>` so alerts can
open the matching detail. The detail should show:

- What happened.
- Why it is abnormal across price, volume, trend, and volatility.
- Why it matters to the portfolio.
- Source timestamp.
- Data blind spots.

## Holdings Table

Show all working symbols, including non-alerting names:

- Symbol, company, weight.
- Close, 1D, 1W, 1M.
- Relative return.
- Technical state summary, including price, volume, trend, and volatility.
- Technical score or primary technical driver as supporting context.
- Attention score or severity band.

## History / Charts

Use `chart/series` as the source of truth for normalized portfolio, benchmark,
and constituent paths. Use runtime feed reads only. Do not inline chart data.

## Alert History

Show latest `alerts/events` records or a quiet state. Collapse repeated quiet
runs into one summary such as `Last 3 runs quiet`; do not render multiple
quiet rows as separate alert cards. This ties phone alerts back to the
interface without creating noise.

## Interaction Rules

- Use Alva design-system CSS.
- Use `AlvaToolkit.AlvaClient` for runtime reads.
- Avoid duplicate outer Playbook chrome in the iframe.
- Keep all visible financial values sourced from feed outputs.
- Make the first screen status-first with the chart as immediate evidence. Do
  not let KPI cards or alert history crowd out the attention answer.
- Make empty and partial-data states honest: show missing symbols and blind
  spots instead of placeholder values.
- Follow the user's preferred language for visible UI copy. Keep ticker symbols
  and market abbreviations unchanged.
