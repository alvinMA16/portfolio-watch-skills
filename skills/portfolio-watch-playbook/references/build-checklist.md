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
- For US equity v1, expect stock kline, company detail, and market metrics.
- Treat more than 20% missing symbols as a blocker. Do not fabricate rows.

## 4. Feed / Automation

- Read `alva-platform/jagent-runtime.md`, `feed-sdk.md`,
  `feed-lifecycle.md`, and `deployment.md`.
- Build outputs from `data-contract.md`: `portfolio/summary`,
  `portfolio/equity`, `watch/assets`, `history/prices`, `chart/series`,
  `signals/events`, `alerts/events`, `alerts/decision`, `capability/status`,
  and `notify/message`.
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
- The first viewport must answer `Anything big?` with `无需关注`, `留意一下`, or
  `请立即关注`, and show the portfolio trend chart as immediate evidence, with usable
  Portfolio / Tickers / Compare controls and SPY / QQQ benchmark toggles when
  data exists.
- The page must not claim news, earnings, analyst revisions, catalysts, or
  thesis drivers are monitored unless the feed actually writes those sourced
  outputs. Show unwired sources in `当前在看什么`.
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
- Confirm `capability/status/@last/1` is fresh and states what is wired versus
  not wired.
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
- Verify with:
  - `alva subscriptions list --first 200`
  - `alva notification-history list-playbook --username <owner> --name <playbook> --first 5`
  - or `alva notification-history list-feed --username <owner> --name <feed> --first 5`
- Do not claim Telegram/Discord/Slack delivery unless `alva whoami` shows an
  active matching channel or notification history confirms it.
