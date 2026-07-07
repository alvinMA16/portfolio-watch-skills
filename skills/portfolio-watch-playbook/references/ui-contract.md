# UI Contract

Build the Playbook as an attention surface, not a generic stock table. The first
viewport should answer: what needs attention now, why, and where to inspect it.

## Required Views

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

The top signal should be visually clear without using oversized marketing-style
layout.

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

Show latest `alerts/events` records or a quiet state. This ties phone alerts
back to the interface and makes quiet behavior inspectable.

## Interaction Rules

- Use Alva design-system CSS.
- Use `AlvaToolkit.AlvaClient` for runtime reads.
- Avoid duplicate outer Playbook chrome in the iframe.
- Keep all visible financial values sourced from feed outputs.
- Make empty and partial-data states honest: show missing symbols and blind
  spots instead of placeholder values.
