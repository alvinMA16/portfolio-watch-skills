---
name: portfolio-watch-playbook
description: Build reusable Alva Portfolio Watch Playbooks from a user's tickers, watchlist, holdings, or connected-account portfolio. Use when the user asks to keep an eye on a portfolio, monitor holdings, watch a basket, or ping/alert/notify them when something material happens. Produces an Alva Playbook with feed-backed data, an attention-ranked interface, scheduled refresh, quiet-by-default alerts, and notification deep links to matching signals.
---

# Portfolio Watch Playbook

Build a reusable Portfolio Watch Playbook, not a one-off ticker dashboard. Turn
an incomplete user request into a running Alva workflow that normalizes the
portfolio, computes attention-ranked signals, renders an inspectable Playbook,
and pushes only high-confidence alerts that link back to the matching signal.

## Build Order

1. Read the local Alva platform references needed for every build:
   - `references/alva-platform/preflight.md`
   - `references/alva-platform/data-skills.md`
   - `references/alva-platform/content-legitimacy.md`
   - `references/alva-platform/feed-lifecycle.md`
   - `references/alva-platform/playbook-creation.md`
   - `references/alva-platform/design.md`
   - `references/alva-platform/design-widgets.md`
   - `references/alva-platform/user-facing-prose.md`
2. Parse the user's input into a portfolio spec: symbols, optional weights,
   market, benchmark, cadence, and alert sensitivity.
3. Read this Skill's references:
   - `references/portfolio-method.md` for attention-triage methodology.
   - `references/data-contract.md` for required feed outputs and fields.
   - `references/ui-contract.md` for Playbook information architecture.
   - `references/alert-contract.md` for quiet-by-default alert behavior.
   - `references/build-checklist.md` for release and verification gates.
4. Generate from `assets/templates/`, replacing all placeholders with the
   user's portfolio and current Alva namespace.
5. Release only after the feed, Playbook, README, screenshot, and alert
   verification gates pass.

## Defaults

- Market: US equities unless the user clearly supplies another covered market.
- Weights: use provided weights; otherwise use equal-weight watch weights and
  label the assumption in the interface and README.
- Benchmark: default to `SPY`; optionally add `QQQ` for tech-heavy portfolios.
- Alert sensitivity: default to balanced.
- Cost basis / realized P&L: omit unless the user supplies account or cost
  data. Do not infer it.
- Cadence: use an end-of-day market refresh for v1 unless the user asks for
  intraday monitoring and data coverage supports it.

## Hard Constraints

- Do not hardcode proof tickers, usernames, feed names, Playbook names, or
  financial values into a generated Playbook.
- Do not embed financial data as inline JavaScript literals in HTML. Published
  HTML must read feed outputs at runtime with `AlvaToolkit.AlvaClient`.
- Do not use WebSearch, LLM output, memory, screenshots, or user examples as
  factual market data. Use Data Skills, released feeds, or validated BYOD.
- Do not generate buy/sell advice, trade execution, UDFs, Altra strategies,
  ONNX inference, Fintwit workflows, or remix behavior unless the user
  explicitly asks for that separate capability.
- Do not send heartbeat alerts. Quiet runs must write the skip sentinel in
  `notify/message`.
- If more than 20% of requested symbols fail legitimate lookup, stop and ask for
  corrected symbols or a supported data source.

## Reusable Assets

- `assets/templates/feed-template.js` is the feed/automation template. It must
  be parameterized before use.
- `assets/templates/index-template.html` is the Playbook interface template. It
  expects the data contract in `references/data-contract.md`.
- `assets/templates/readme-template.md` is the methodology README template. It
  must be regenerated for each released Playbook.
