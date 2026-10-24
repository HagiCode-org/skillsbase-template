---
public: true
multilingual: false
style: product
---

# README requirements

## Product focus

- Present `skillsbase-template` as the ready-made starting point for a `skillsbase`-managed skills repository: a repository created from it already ships the HagiCode CLI `hagi` skill (from `HagiCode-org/cli@hagi`) under `skills/hagi/`, with no extra bootstrap step.
- Address developers and teams who want to publish and maintain their own skills repository. This is a developer-facing template, so developer usage (commands and source declarations) is in scope.
- Lead with what the template gives them (the default `hagi` skill and one-command sync and check), then how to start using it.

## Required content

- Open with the key points: the default content (the `hagi` skill from `HagiCode-org/cli@hagi`), the managed output committed under `skills/hagi/`, and the use of the official `skillsbase` entrypoints only.
- Explain the default source block (`HagiCode-org/cli`, `include: [hagi]`) and how to change it by editing `sources.yaml` and syncing again. Source entries must match `sources.yaml`.
- Show how to use the template: install `skillsbase` globally, then `npm ci`, `npm run sync`, `npm run sync:check` and `npm test`. Commands must match `package.json`.
- Link to `docs/maintainer-workflow.md` for the full flow instead of copying it.

## Exclusions

- Exclude tokens, secret values, internal hosts, machine-specific paths and private links.
- Keep repository maintenance instructions out of the README: the GitHub maintenance workflow, CI, build internals and contribution workflow.
