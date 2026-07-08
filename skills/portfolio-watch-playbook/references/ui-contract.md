# UI Contract

Build the Playbook as an alert decision surface, not a generic stock table. The
first viewport should answer: did Alva notify the user, why or why not, and
what should the user inspect next.

## Required Views

## Alert Decision

This is the first useful region in the iframe.

Show `alerts/decision` in plain language:

- Notification state: `quiet`, `watch`, `sent`, or `setup`.
- Human conclusion, such as `No ping sent` or `Ping sent for GOOGL`.
- Reason in one or two evidence-backed sentences.
- Next action, such as `No action needed` or `Open GOOGL detail`.
- Link target matching `deepLinkAnchor` when a signal exists.

When state is `setup`, make clear that the user received a one-time
subscription confirmation and that no market signal is being claimed.

Do not make the user infer notification behavior from score, severity,
thresholds, or repeated quiet rows.

## Overview

Show the current portfolio state:

- Portfolio risk state.
- Latest as-of timestamp.
- Portfolio 1D / 1W / 1M returns.
- High and medium signal counts.
- Weighting and benchmark assumptions.

## Signal Queue

Show `signals/events` sorted by severity and score. Each row/card must include:

- Symbol and title.
- Severity.
- Short reason.
- Portfolio impact.
- Evidence summary.
- Link target matching `deepLinkAnchor`.

The top signal should be visually clear and must state whether it did or did
not clear the alert bar. Use plain sentences such as:

`GOOGL moved more than usual, but portfolio impact stayed below the alert bar.`

## Signal Detail

Each signal must have a stable anchor such as `#signal-<signalId>` so alerts can
open the matching detail. The detail should show:

- What happened.
- Why it is abnormal.
- Why it matters to the portfolio.
- Source timestamp.
- Data blind spots.

## Holdings Table

Show all working symbols, including non-alerting names:

- Symbol, company, weight.
- Close, 1D, 1W, 1M.
- Relative return and trend state when available.
- RSI / MA state.
- Attention score or severity band.

## History / Charts

Show normalized portfolio path and constituent paths from feed data. Use runtime
feed reads only. Do not inline chart data.

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
- Make empty and partial-data states honest: show missing symbols and blind
  spots instead of placeholder values.
- Follow the user's preferred language for visible UI copy. Keep ticker symbols
  and market abbreviations unchanged.
