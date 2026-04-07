# skillsbase-template

`skillsbase-template` is the canonical template for a `skillsbase`-managed skills repository.

Key points:

- The template includes the HagiCode CLI `hagi` skill by default
- The default source points to `HagiCode-org/cli@hagi`
- The managed output is committed under `skills/hagi/`
- Maintenance commands use the official `skillsbase` entrypoints only

## Default Content

The template declares one remote source block by default:

- `HagiCode-org/cli`
- Default `include: [hagi]`

As a result, a new repository created from this template already contains `skills/hagi/` without an extra bootstrap step.

## Maintenance Commands

```bash
npm install --global @hagicode/skillsbase
npm ci
npm run sync
npm run sync:check
npm test
```

These commands call the global `skillsbase` CLI directly. Synchronization pulls the default `hagi` skill from GitHub.

## GitHub Maintenance Path

The managed GitHub automation now exposes `.github/workflows/skills-manage.yml` for explicit non-interactive maintenance:

- Choose `operation=add`, `remove`, or `sync`
- Provide `skill-name` for `add` and `remove`
- Optionally pass `source` and `allow-missing-sources`
- Keep `run-tests=true` when the workflow should validate the repository after the command

This path is an automation option, not the primary maintainer flow. It updates the working tree inside the runner only and does not commit, push, or open pull requests.

## Maintenance Rules

- Do not edit `skills/hagi/**` by hand
- To change the default skill, update the remote source declaration in `sources.yaml` or wait for upstream changes in `HagiCode-org/cli`
- Run `npm run sync` after changing the source contract
- In CI or other non-interactive environments, use `npm test` and `npm run sync:check`
- Use the GitHub maintenance workflow only when a maintainer needs a UI-triggered non-interactive `add`, `remove`, or `sync`

For the full maintainer flow, see `docs/maintainer-workflow.md`.
