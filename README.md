# Portfolio Watch Skills

Standalone take-home repository for an Alva Portfolio Watch Skill.

The Skill turns a user's tickers, watchlist, holdings, or portfolio request into
a reusable Alva Playbook build plan: normalize inputs, create feed-backed
outputs, rank attention signals, render a Playbook interface, and configure
quiet-by-default alerts that link back to matching signals.

## Layout

```text
skills/
  portfolio-watch-playbook/
    SKILL.md
    agents/openai.yaml
    references/
    assets/templates/
scripts/
  quick_validate.py
one_page.md
```

The Skill includes the Alva platform references needed to build and release
Portfolio Watch Playbooks without relying on another local skills checkout.

## Validate

```bash
python3 scripts/quick_validate.py skills/portfolio-watch-playbook
```

## Example prompt

```text
Use the Portfolio Watch Playbook Skill to keep an eye on MSFT, AMZN, and GOOGL.
Ping me only when something material happens.
```
