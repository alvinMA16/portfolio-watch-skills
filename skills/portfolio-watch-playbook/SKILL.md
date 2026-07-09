---
name: portfolio-watch-playbook
description: Build reusable Alva Portfolio Watch Playbooks from a user's tickers, watchlist, holdings, or connected-account portfolio. Use when the user asks to keep an eye on a portfolio, monitor holdings, watch a basket, or ping/alert/notify them when something material happens. Produces an Alva Playbook with feed-backed data, a visual-first portfolio trend surface, attention-ranked signals, scheduled refresh, quiet-by-default alerts, and notification deep links to matching signals.
---

# Portfolio Watch Playbook

Build a reusable Portfolio Watch Playbook, not a one-off ticker dashboard. Turn
an incomplete user request into a running Alva workflow that normalizes the
portfolio, computes attention-ranked signals, renders a status-first Playbook
that answers `Anything big?` with a plain red/yellow/green result, shows
  concrete evidence for each holding, adds sourced event context when available,
  places the chart as the next evidence layer, and pushes only high-confidence
  alerts that link back to the matching signal.

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

## Product North Star

The first screen must answer: **Anything big?** It should show, in this order:

1. A one-sentence explanation of what the Playbook monitors: price, volume,
   trend, volatility, portfolio impact, SPY/QQQ context, and any successfully
   wired event context such as recent news, earnings dates, or analyst changes.
2. A large fixed `Anything big?` title, followed by a concrete answer sentence.
   Do not replace the title with the status label or narrative sentence. Use
   `narrative/brief.summary` when available and deterministic feed-backed prose
   otherwise.
3. One card per working holding with concrete evidence: 1D move, relative move,
   volume ratio, portfolio impact, and whether the move has matched event
   context or is still price-driven. When a matched news event has a URL,
   render it as a clickable source link inside the holding card, not plain text.
4. The portfolio trend chart as the next evidence layer.

Keep `Anything big?` as the complete first region and place the chart directly
below it. Do not make users start with `Watch`, `Medium`, score numbers,
`Portfolio risk elevated`, repeated quiet rows, empty "why" fields, or raw
indicator tables. Charts remain the evidence layer; the primary product answer
is whether anything big happened and what concrete data supports that answer.

Do not add a separate holdings-status table that repeats the first-screen
holding cards. If a holding-level state is needed, put it in the first-screen
cards or in the signal detail evidence. Use one visual component for all
red/yellow/green labels across the page. Do not add a separate
`值得留意的变化` section when it repeats the same holdings already shown in the
first-screen cards.

Render `证据明细` as a table, not a repeated card grid. Keep stable anchors on
the table rows so notifications can still deep-link to the relevant signal.
Do not show low-value generic caveats under every evidence row. Only show
missing-source copy when a source that normally participates in the decision was
unavailable for the current run.
Any visible signed return or relative-return percentage must use green for
positive values and red for negative values, including values inside narrative
sentences.

When using alpi for user-facing prose, use it only to summarize already-wired
feed data. It may mention news, earnings dates, analyst changes, or catalysts
only when those records exist in feed outputs. It must not invent thesis
changes, financial values, events, or recommendations. The page must work with
deterministic fallback prose if the model output is unavailable.

## Defaults

- Market: US equities unless the user clearly supplies another covered market.
- Weights: use provided weights; otherwise use equal-weight watch weights and
  label the assumption in the interface and README.
- Benchmarks: default to `SPY` and `QQQ` for chart comparison. Use `SPY` as the
  primary benchmark for relative-move scoring unless the user specifies another
  primary benchmark.
- Chart range: default the first-screen trend chart to `3M`. Offer `1M`, `3M`,
  `6M`, and `All` controls when chart history supports them.
- Alert sensitivity: default to balanced.
- Cost basis / realized P&L: omit unless the user supplies account or cost
  data. Do not infer it.
- Cadence: use an end-of-day market refresh for v1 unless the user asks for
  intraday monitoring and data coverage supports it.
- Language: follow the user's current language and stable memory preference
  for visible UI, README, and alert-decision prose. Keep ticker symbols and
  structured field names unchanged.

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
- Do not claim the Playbook watches news, earnings, analyst revisions,
  company-specific catalysts, or holding thesis drivers unless those sources
  are actually wired into the feed and succeeded for the current run. If they
  are unavailable, show them as explicit blind spots and do not let them affect
  red/yellow/green decisions.
- Do send one explicit setup confirmation after the first successful
  subscription. Treat it as a one-time delivery-chain confirmation, not a
  market alert: the message must say the monitor is on, say it is not a market
  signal, and link to the Playbook. Do not repeat it on later quiet runs.
- Do not render quiet runs as repeated alert cards. Summarize quiet history as
  an inspectable state such as "recent runs quiet."
- If more than 20% of requested symbols fail legitimate lookup, stop and ask for
  corrected symbols or a supported data source.

## Reusable Assets

- `assets/templates/feed-template.js` is the feed/automation template. It must
  be parameterized before use.
- `assets/templates/index-template.html` is the Playbook interface template. It
  expects the data contract in `references/data-contract.md`.
- `assets/templates/readme-template.md` is the methodology README template. It
  must be regenerated for each released Playbook.
