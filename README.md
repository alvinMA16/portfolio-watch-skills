# Portfolio Watch Playbook Skill

Build a reusable Alva Portfolio Watch Playbook from a user's tickers,
watchlist, or holdings. The resulting Playbook is a live, visual-first
monitor: it ranks what deserves attention, explains the evidence, refreshes on
a schedule, and sends quiet-by-default alerts that link back to the relevant
evidence.

## What it does

- Turns incomplete portfolio requests into an explicit monitoring spec:
  symbols, weights, benchmark, cadence, sensitivity, and language.
- Builds feed-backed views for price action, relative performance, volume,
  trend, volatility, portfolio impact, and available event context.
- Separates a change worth reading in the Playbook from a change important
  enough to interrupt the user with a notification.
- Creates a status-first interface that answers `Anything big?` before showing
  holding-level evidence and charts.
- Adds scheduled, quiet-by-default notifications with a deep link to the
  matching evidence row.

## When to use it

Use this Skill when a user asks to:

- keep an eye on a portfolio, watchlist, or basket of stocks;
- monitor specific holdings and surface meaningful changes;
- receive a notification only when something material happens; or
- create a shareable Portfolio Watch Playbook rather than receive a one-off
  market answer.

It is designed for monitoring and research, not trading execution or
investment advice. The default v1 workflow is an end-of-day monitor for US
equities. It does not infer cost basis, realised P&L, or tax lots when the user
has not supplied account data.

## Prerequisites

- Node.js and `npx`.
- Either Codex or Claude Code.
- An authenticated Alva CLI and an Alva account with the necessary data and
  notification access.

Install and authenticate the Alva CLI if it is not already available:

```bash
npm install -g @alva-ai/toolkit
alva auth login
alva whoami
```

Install Alva's official Skill collection once for the agent you use:

```bash
# Codex
npx skills add https://github.com/alva-ai/skills --agent codex

# Claude Code
npx skills add https://github.com/alva-ai/skills --agent claude-code
```

## Install this Skill

Run the following command from the project where you want to use the Skill.
The default is a project-level installation, so the setup can be committed and
shared with the team.

```bash
# Codex
npx skills add alvinMA16/portfolio-watch-skills \
  --skill portfolio-watch-playbook \
  --agent codex

# Claude Code
npx skills add alvinMA16/portfolio-watch-skills \
  --skill portfolio-watch-playbook \
  --agent claude-code
```

To make it available across projects for one agent, add `--global`:

```bash
npx skills add alvinMA16/portfolio-watch-skills \
  --skill portfolio-watch-playbook \
  --agent codex \
  --global
```

The `skills` CLI supports both Codex and Claude Code and can install a selected
Skill from a GitHub repository. See the [skills CLI documentation](https://github.com/vercel-labs/skills)
for other installation options.

## Use it

After installation, open Codex or Claude Code from the target project and use
the Skill explicitly with `$portfolio-watch-playbook`, or describe a matching
monitoring request in natural language.

### Basic example

```text
Use $portfolio-watch-playbook to keep an eye on NVDA, TSLA, and AAPL.
Ping me only when something material happens.
```

### Another English example

```text
Use $portfolio-watch-playbook to watch MSFT, AMZN, and GOOGL.
Let me know when there is something worth looking at.
```

### Chinese example

```text
使用 $portfolio-watch-playbook 盯住我的 NVDA、TSLA 和 AAPL。
只有出现重要变化时才提醒我。
```
