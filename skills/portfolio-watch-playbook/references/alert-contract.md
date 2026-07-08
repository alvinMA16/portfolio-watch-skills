# Alert Contract

Portfolio Watch alerts are quiet by default. The Playbook should show all
recent attention signals, but the phone should only receive a notification when
a high-severity event is fresh, relevant, explainable, and not a duplicate.

There is one allowed exception: after the user's first successful subscription,
send a one-time setup confirmation to prove the delivery chain works. This is
not a market alert or heartbeat. It must clearly say the monitor is on, say no
market signal is being claimed, and link to the Playbook.

## Feed Outputs

- `signals/events`: all ranked signal candidates for the Playbook.
- `alerts/events`: high-severity alert candidates and delivery audit rows.
- `alerts/decision`: one plain-language decision row explaining whether the
  user was notified, why, and what to inspect next.
- `notify/message`: push sidecar consumed by Alva notification delivery.

Each alertable event must include: `signalId`, `symbol`, `severity`, `title`,
`body`, `portfolioImpactPct`, `triggerType`, `asOf`, `dedupKey`, and
`deepLinkAnchor`.

## Push Policy

- Push only high-severity events.
- Keep medium and low signals in the Playbook, not in phone notifications.
- Write one `notify/message` row per automation run.
- Write one `alerts/decision` row per automation run.
- For quiet runs, set `body` to `<|SKIP_NOTIFICATION|>`, unless the run was
  explicitly triggered as the first-subscription setup confirmation.
- Never send generic heartbeat alerts.
- Send at most one setup confirmation per Playbook/feed. Do not let ordinary
  test runs consume it. Trigger it only after subscription is active.
- If several high signals fire, put the highest priority event first and
  summarize the rest.
- Suppress repeated alerts with the same `dedupKey` inside the configured
  cool-down window when previous alert history is available.
- Quiet decisions must name the reason: below threshold, duplicate, no signal,
  or missing data. Do not make the user infer quiet behavior from repeated
  audit cards.

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

Setup confirmation body requirements:

- Say the Portfolio Watch is now on.
- Say this is a one-time setup confirmation, not a market signal.
- State the current decision briefly, such as no material signal right now.
- Link to the canonical Playbook URL.

## Decision Shape

`alerts/decision` is the Playbook's first-screen source of truth. It should read
like a concise product conclusion, not a diagnostics record.

Examples:

- Quiet: `No ping sent. GOOGL is on watch, but its portfolio impact is below
  the alert bar. No action needed; open GOOGL detail if you want context.`
- Sent: `Ping sent for GOOGL. The move cleared the high-severity bar and was
  not a duplicate. Open the GOOGL signal detail.`
- Setup: `Setup confirmation sent. Portfolio Watch is on; no market signal is
  being claimed. Open the Playbook to inspect the current state.`

Use the user's preferred language for `decisionTitle`, `decisionBody`,
`nextAction`, and `nextTrigger` when memory or the current request makes it
clear.

## Current CLI Flow

Use current `alva subscriptions` commands. Do not use deprecated
alert-subcommand wording from older docs.

1. Add `notify/message` to the feed script, including an explicit one-time
   setup-confirmation mode such as `env.args.initialConfirmation === true`.
2. Run the feed and confirm `notify/message/@last/1` is fresh and non-empty, or
   contains `<|SKIP_NOTIFICATION|>` for a quiet run.
   Also confirm `alerts/decision/@last/1` is fresh and explains the current
   decision.
3. Enable publisher push on the cronjob:
   `alva deploy update --id <cronjob_id> --push-notify`.
4. Register or re-register the feed with `alva release feed`.
5. Subscribe the user:
   - `alva subscriptions subscribe-playbook --username <owner> --name <playbook>`
   - or `alva subscriptions subscribe-feed --username <owner> --name <feed>`
6. After the first successful subscription, send the one-time setup
   confirmation:
   - Temporarily set the deployed automation args to
     `{"initialConfirmation":true}`.
   - Trigger the deployed automation once.
   - Poll run history until complete.
   - Clear automation args back to `{}` so later quiet runs stay quiet.
   - If the current run emits a real high-severity alert instead, count that as
     delivery-chain proof and do not send a separate setup confirmation.
7. Verify:
   - `alva subscriptions list --first 200`
   - `alva notification-history list-playbook --username <owner> --name <playbook> --first 5`
   - or `alva notification-history list-feed --username <owner> --name <feed> --first 5`

## Delivery Channel

Web notifications work by default. External IM delivery depends on the user's
active channel from `alva whoami` and a matching Telegram, Discord, or Slack
username. If no active IM channel exists, state that web notifications are
ready and the user can connect an IM channel in Alva settings.
