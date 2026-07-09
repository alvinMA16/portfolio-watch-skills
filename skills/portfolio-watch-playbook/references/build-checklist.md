# Build Checklist

Use this checklist when generating a Portfolio Watch Playbook from this Skill.
Read referenced files under `references/alva-platform/`; do not rely on a
separate local checkout of the official Alva Skill.

## 1. Preflight

- Read `alva-platform/preflight.md`.
- Run `alva --help` and command-specific `--help` before each new command.
- Run `alva whoami`; capture `username`, subscription tier, active delivery
  channel, and Arrays JWT status.
- If Arrays JWT needs refresh, use `alva arrays token ensure`.

## 2. Portfolio Spec

- Parse symbols and optional weights.
- Normalize weights to 100% when supplied; otherwise use equal-weight watch
  weights and label the assumption.
- Set benchmark, cadence, and sensitivity defaults when omitted.
- Stop if the user expects account P&L but has not supplied account or cost
  data.

## 3. Data Discovery

- Read `alva-platform/data-skills.md` and
  `alva-platform/content-legitimacy.md`.
- Discover live endpoint docs with `alva data-skills list`, then `summary`,
  then `endpoint`.
- For US equity v1, expect stock kline, company detail, market metrics,
  earnings calendar, market news, and analyst estimate/target endpoint docs.
  News and analyst endpoints may require Pro; if unavailable, the generated
  Playbook must mark them unavailable for that run.
- Treat more than 20% missing symbols as a blocker. Do not fabricate rows.

## 4. Feed / Automation

- Read `alva-platform/jagent-runtime.md`, `feed-sdk.md`,
  `feed-lifecycle.md`, and `deployment.md`.
- Build outputs from `data-contract.md`: `portfolio/summary`,
  `portfolio/equity`, `watch/assets`, `history/prices`, `chart/series`,
  `signals/events`, `context/events`, `alerts/events`, `alerts/decision`,
  `narrative/brief`, `capability/status`, and `notify/message`.
- Run the exact ALFS script with `alva run --entry-path ...` after every
  meaningful change. Do not pass `initialConfirmation` during pre-subscription
  test runs; that mode is reserved for the first subscribed automation run.
- Grant public read on the feed root when the Playbook is public.
- Deploy with `alva deploy create`; use `--push-notify` or
  `alva deploy update --id <id> --push-notify` after `notify/message` exists.
- Register the feed with `alva release feed --name <feed> --version <version>
  --cronjob-id <id>`.

## 5. Playbook

- Read `alva-platform/playbook-creation.md`, `design.md`,
  `design-widgets.md`, and `user-facing-prose.md`.
- Follow `ui-contract.md`: Anything Big status, portfolio trend, today queue,
  evidence explanation, holdings, notification audit, and capability status.
- The first viewport must explain what is monitored, answer `Anything big?`
  as a large title followed by a concrete sentence instead of a duplicated
  status label, and show each holding's concrete 1D, relative, volume, and
  portfolio-impact evidence. The portfolio trend chart should sit directly
  below it with usable Portfolio / Tickers / Compare controls and SPY / QQQ
  benchmark toggles when data exists.
- Do not render a separate holdings-status table that repeats the first-screen
  holding cards. Each holding card should show whether the move has matching
  event context or is still price-driven. If matched news has a URL, render the
  source/title as a clickable link in the holding card.
- Do not render a separate localized "changes worth watching", "today queue",
  or similar section when it repeats the first-screen holding cards.
- Render the localized evidence-detail section as a table with row anchors, not
  a repeated card grid. Include an event-evidence column sourced from
  `signals/events` and `context/events`.
- Evidence-missing copy should appear only when a source that normally
  participates in the decision was unavailable for the current run. Do not show
  generic caveats under every row.
- Signed return and relative-return values must be green when positive and red
  when negative everywhere they appear.
- Use one status-chip treatment for localized green/yellow/red labels
  everywhere those labels appear.
- In the localized notification-status section, include a compact manual-test
  control such as `Send test` in English or `发个测试` in Chinese. It must call
  the registered owner-only `sendTestNotification` UDF. The button must trigger
  a real manual `testNotification:true` automation run and show a simple
  sent/failed result. Do not implement it as a latest-message reader or
  subscribe proposal. Manual tests are delivery-chain tests, while yellow
  changes stay in the Playbook and only red market changes are eligible for
  ordinary push.
- In the localized notification-status section, show recent sent notification
  decisions from `alerts/decision` with localized type and sent time. Include
  only `sent`, `setup`, and `test` rows in the sent-history list; do not mix
  quiet/watch rows into "sent" history.
- The page must not claim news, earnings, analyst revisions, catalysts, or
  thesis drivers are monitored unless the feed actually writes those sourced
  outputs and the current run succeeded. Show unavailable sources in
  the localized monitoring-scope section.
- Verify language before release. The selected output language defaults to the
  dominant language of the user's original request unless the user explicitly
  asks for another language. For an English prompt, search generated `index.html`,
  `README.md`, feed code, and UDF code for Chinese-only visible strings such as
  `证据明细`, `通知状态`, `发个测试`, `无需关注`, `留意一下`, `请立即关注`, `正式通知`,
  `测试通知`, and `设置确认`; none should remain in released user-facing copy.
  For a Chinese prompt, confirm the main UI, README, alert messages, setup/test
  notification copy, and alpi prompt are primarily Chinese.
- HTML must use `AlvaToolkit.AlvaClient` for runtime reads.
- Write HTML and README to `~/playbooks/<name>/`.
- Draft with `alva release playbook-draft`.
- Release with `alva release playbook --readme-url /alva/home/<username>/playbooks/<name>/README.md`.
- Run `alva lint playbook ./index.html`.
- Verify the released `published_url` with `alva screenshot`; the image must
  show real feed-backed data, not a loading or error state.

## 6. Alerts

- Read `alert-contract.md`.
- Confirm `notify/message/@last/1` is fresh and contains either a real message
  or `<|SKIP_NOTIFICATION|>`.
- Confirm `alerts/decision/@last/1` is fresh and explains the current
  notification decision.
- Confirm `alerts/decision/@last/40` includes labeled `sent`, `setup`, or `test`
  rows when notifications have been emitted, and that the Playbook renders their
  type and sent time.
- For any `sent` row, confirm `notify/message/@last/1` includes a Markdown link
  whose URL is the canonical Playbook URL plus `#<deepLinkAnchor>`, and confirm
  the released HTML has a matching DOM id for that anchor.
- Confirm `capability/status/@last/1` is fresh and states what is wired versus
  not wired.
- Confirm `context/events/@last/20` is fresh when event context is enabled, or
  that `capability/status` clearly states why event context was unavailable.
- Subscribe with:
  - `alva subscriptions subscribe-playbook --username <owner> --name <playbook>`
  - or `alva subscriptions subscribe-feed --username <owner> --name <feed>`
- For the first successful subscription, verify delivery with a one-time setup
  confirmation:
  - Temporarily update the deployed automation args to
    `{"initialConfirmation":true}`.
  - Trigger the deployed automation once and poll until it completes.
  - Confirm `notification-history` shows a sent setup confirmation, or a real
    red market alert if one fired on that run.
  - Clear the deployed automation args back to `{}` after the confirmation run.
  - Confirm a later quiet run writes `<|SKIP_NOTIFICATION|>` and does not send
    another setup confirmation.
- For an explicit manual delivery test, temporarily run the automation with
  `{"testNotification":true}`, verify notification history shows a labeled
  test message, then clear args back to `{}` and verify `alva deploy get`
  reports empty args.
- Register `assets/templates/send-test-notification-udf-template.js` as
  `sendTestNotification` after replacing `REPLACE_OWNER_USER_ID` and
  `REPLACE_CRONJOB_ID`. Confirm `ALVA_API_KEY` exists in Secret Manager,
  register with `--no-allow-charges`, and smoke test with
  `alva functions invoke --playbook-id <id> --function-name sendTestNotification --params '{}'`.
- Verify with:
  - `alva subscriptions list --first 200`
  - `alva notification-history list-playbook --username <owner> --name <playbook> --first 5`
  - or `alva notification-history list-feed --username <owner> --name <feed> --first 5`
- Do not claim Telegram/Discord/Slack delivery unless `alva whoami` shows an
  active matching channel or notification history confirms it.
