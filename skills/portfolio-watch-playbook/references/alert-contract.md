# Alert Contract

Portfolio Watch alerts are quiet by default. The Playbook should show all
recent attention signals, but the phone should only receive a notification when
a high-severity event is fresh, relevant, explainable, and not a duplicate.

## Feed Outputs

- `signals/events`: all ranked signal candidates for the Playbook.
- `alerts/events`: high-severity alert candidates and delivery audit rows.
- `notify/message`: push sidecar consumed by Alva notification delivery.

Each alertable event must include: `signalId`, `symbol`, `severity`, `title`,
`body`, `portfolioImpactPct`, `triggerType`, `asOf`, `dedupKey`, and
`deepLinkAnchor`.

## Push Policy

- Push only high-severity events.
- Keep medium and low signals in the Playbook, not in phone notifications.
- Write one `notify/message` row per automation run.
- For quiet runs, set `body` to `<|SKIP_NOTIFICATION|>`.
- Never send generic heartbeat alerts.
- If several high signals fire, put the highest priority event first and
  summarize the rest.
- Suppress repeated alerts with the same `dedupKey` inside the configured
  cool-down window when previous alert history is available.

## Message Shape

`notify/message` fields:

- `title`: concise Portfolio Watch title.
- `body`: Markdown body with the top signal, short rationale, portfolio impact,
  and Playbook link.

Body requirements:

- Say what happened.
- Say why it matters.
- Include the affected symbol.
- Include portfolio impact when available.
- Link to the canonical Playbook URL with a fragment matching
  `deepLinkAnchor`, such as `#signal-<signalId>`.
- Keep it short enough for IM delivery.

## Current CLI Flow

Use current `alva subscriptions` commands. Do not use deprecated
alert-subcommand wording from older docs.

1. Add `notify/message` to the feed script.
2. Run the feed and confirm `notify/message/@last/1` is fresh and non-empty, or
   contains `<|SKIP_NOTIFICATION|>` for a quiet run.
3. Enable publisher push on the cronjob:
   `alva deploy update --id <cronjob_id> --push-notify`.
4. Register or re-register the feed with `alva release feed`.
5. Subscribe the user:
   - `alva subscriptions subscribe-playbook --username <owner> --name <playbook>`
   - or `alva subscriptions subscribe-feed --username <owner> --name <feed>`
6. Verify:
   - `alva subscriptions list --first 200`
   - `alva notification-history list-playbook --username <owner> --name <playbook> --first 5`
   - or `alva notification-history list-feed --username <owner> --name <feed> --first 5`

## Delivery Channel

Web notifications work by default. External IM delivery depends on the user's
active channel from `alva whoami` and a matching Telegram, Discord, or Slack
username. If no active IM channel exists, state that web notifications are
ready and the user can connect an IM channel in Alva settings.
