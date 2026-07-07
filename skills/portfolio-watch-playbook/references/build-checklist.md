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
  `portfolio/equity`, `watch/assets`, `history/prices`, `signals/events`,
  `alerts/events`, and `notify/message`.
- Run the exact ALFS script with `alva run --entry-path ...` after every
  meaningful change.
- Grant public read on the feed root when the Playbook is public.
- Deploy with `alva deploy create`; use `--push-notify` or
  `alva deploy update --id <id> --push-notify` after `notify/message` exists.
- Register the feed with `alva release feed --name <feed> --version <version>
  --cronjob-id <id>`.

## 5. Playbook

- Read `alva-platform/playbook-creation.md`, `design.md`,
  `design-widgets.md`, and `user-facing-prose.md`.
- Follow `ui-contract.md`: overview, signal queue, signal detail, holdings,
  charts, and alert history.
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
- Subscribe with:
  - `alva subscriptions subscribe-playbook --username <owner> --name <playbook>`
  - or `alva subscriptions subscribe-feed --username <owner> --name <feed>`
- Verify with:
  - `alva subscriptions list --first 200`
  - `alva notification-history list-playbook --username <owner> --name <playbook> --first 5`
  - or `alva notification-history list-feed --username <owner> --name <feed> --first 5`
- Do not claim Telegram/Discord/Slack delivery unless `alva whoami` shows an
  active matching channel or notification history confirms it.
