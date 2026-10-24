# skillsbase-template

[![last commit](https://img.shields.io/github/last-commit/HagiCode-org/skillsbase-template)](https://github.com/HagiCode-org/skillsbase-template/commits/main)

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

## Maintenance Rules

- Do not edit `skills/hagi/**` by hand
- To change the default skill, update the remote source declaration in `sources.yaml` or wait for upstream changes in `HagiCode-org/cli`
- Run `npm run sync` after changing the source contract

For the full maintainer flow, see `docs/maintainer-workflow.md`.
