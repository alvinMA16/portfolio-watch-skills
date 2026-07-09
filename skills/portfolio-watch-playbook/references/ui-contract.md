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
  trend, volatility, portfolio impact, SPY/QQQ context, and successfully wired
  event context such as recent news, earnings dates, or analyst changes.
- Main title: render `Anything big?` as the large first-screen title.
- Main answer: render one concrete sentence below that title from
  `narrative/brief.summary` when available, otherwise a deterministic sentence
  from `portfolio/summary`, `signals/events`, and `alerts/decision`.
- Do not render the overall status label as a large headline or duplicate
  top-right chip. The useful first-screen content is the concrete sentence and
  the holding-level red/yellow/green state.
- Holding answers: one card per working holding using the same labels and
  showing 1D return, relative return versus SPY, volume ratio, portfolio
  impact, and a short background line such as `匹配到 1 条新闻` or
  `暂未匹配到新闻/财报/预期变化`. If the matched event is news and has a URL,
  render the source/title as a clickable link in the holding card.
- Last checked should be a small timestamp, not a content block.
- Use the same status-chip component everywhere a red/yellow/green label
  appears. Do not show both color-name labels such as `黄色` and action labels
  such as `留意一下`.

Place the chart directly below the Anything Big region on desktop and mobile.
Do not let KPI cards, alert history, raw scores, internal mechanism words,
empty "why" fields, or generic "worth a look" copy crowd out this answer.
Do not render a separate holdings table that repeats the first-screen holding
cards. Do not render a separate `值得留意的变化` section when it repeats the same
holdings already shown in the first-screen cards.

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

## 通知状态

Show `alerts/decision` after `证据明细`, not before it:

- Notification state: `quiet`, `watch`, `sent`, `setup`, or `test`.
- Human conclusion, such as `无需关注`, `留意一下`, or `请立即关注`.
- Reason in one or two evidence-backed sentences.
- Next action, such as `No action needed` or `Open GOOGL detail`.
- Link target matching `deepLinkAnchor` when a signal exists.
- A compact "最近发出的通知" history from recent `alerts/decision` rows with
  state `sent`, `setup`, or `test`. Each row must show type (`正式通知`,
  `设置确认`, or `测试通知`) and sent time. Do not query Alva notification-history
  from browser HTML; use that official surface only in build verification.

Place a compact right-aligned `发个测试` button in the section title. The button
must call the registered owner-only `sendTestNotification` UDF, which triggers a
real `testNotification:true` automation run, retries clearing cronjob args back
to `{}`, and returns a sent/failed result. Do not implement this button as a
latest-message reader. Do not wire raw subscription or notification APIs from
HTML, and do not use `window.alva.subscribe.propose()`; that API is only for
turning on alerts and can trigger parent-frame subscription flows. If the UDF is
unavailable or sending fails, show a clear inline error instead of throwing a
console error. If the Playbook is opened outside the Alva parent page or lacks a
PBSV token, say to open it from the canonical Alva Playbook page.

When state is `setup`, make clear that the user received a one-time
subscription confirmation and that no market signal is being claimed.
When state is `test`, make clear that a manual delivery test was sent and that
no market signal is being claimed.

Do not make the user infer notification behavior from score, severity,
thresholds, or repeated quiet rows. Also do not imply that "留意一下" always
means "worth alerting." Every notification-status card should include the rule
in plain language: green/yellow changes stay in the Playbook; only red
`请立即关注` changes are eligible for push, and external IM delivery also depends
on the user's Alva notification channel.

## 证据明细

Each signal must have a stable anchor such as `#signal-<signalId>` so alerts can
open the matching detail. Render this section as a table, not a card grid. The
table should show:

- What happened.
- Why it is abnormal across price, volume, trend, and volatility.
- Why it matters to the portfolio.
- Evidence present.
- Event evidence from `context/events`, when present.
- Missing-source copy only when a source that normally participates in the
  decision was unavailable for the current run. Do not repeat generic caveats
  under every row.
- Source timestamp.
- Data blind spots.

## History / Charts

Use `chart/series` as the source of truth for normalized portfolio, benchmark,
and constituent paths. Use runtime feed reads only. Do not inline chart data.

## 监控范围

Show `capability/status` so the Playbook is honest about its scope:

- Already wired inputs, such as price, volume, trend, volatility, portfolio
  impact, SPY/QQQ context, and event sources that succeeded in the current run.
- Not wired or unavailable inputs, such as news, earnings, analyst revisions,
  personal holding assumptions, options activity, or social signals that did
  not participate in the current run.
- A short limitation statement that the Playbook does not draw conclusions from
  unwired data.

## Interaction Rules

- Use Alva design-system CSS.
- Use `AlvaToolkit.AlvaClient` for runtime reads.
- Avoid duplicate outer Playbook chrome in the iframe.
- Keep all visible financial values sourced from feed outputs.
- Make the first screen status-first with the chart as immediate evidence. Do
  not let KPI cards or alert history crowd out the attention answer.
- Use one visual treatment for `无需关注`, `留意一下`, and `请立即关注` everywhere
  those labels appear.
- Use green for positive signed return / relative-return values and red for
  negative signed return / relative-return values everywhere they appear,
  including narrative text, holding rows, chart reads, and evidence tables.
- Make empty and partial-data states honest: show missing symbols and blind
  spots instead of placeholder values.
- Do not show `Portfolio risk elevated`, `review candidate`, `gate`, raw
  severity, or score bands as the first-screen answer.
- Follow the user's preferred language for visible UI copy. Keep ticker symbols
  and market abbreviations unchanged.
