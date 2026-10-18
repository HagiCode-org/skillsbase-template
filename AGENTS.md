# skillsbase-template - Agent Configuration

## Root Configuration

Inherits all behavior from `/AGENTS.md` at the monorepo root. Local rules extend or override the root file for this repository.

## Project Context

`skillsbase-template` is the canonical template for a `skillsbase`-managed skills repository. It includes the HagiCode CLI `hagi` skill by default and uses `@hagicode/skillsbase` for maintenance.

## Working Directory

Run commands from `repos/skillsbase-template/`.

## Key Commands

```bash
npm install
npm run sync
npm run sync:check
npm test
```

## Key Paths

- `skills/hagi/`: managed Hagi CLI skill output
- `tests/`: template tests
- `sources.yaml`: skillsbase source configuration (single source of truth for managed skills)
- `.github/workflows/`: `skills-sync.yml` validation and `skills-manage.yml` manual add/remove/sync
- `docs/maintainer-workflow.md`: full maintainer flow

## Agent Guidelines

- Use `npm run sync` to refresh managed skill output; never edit `skills/` manually.
- Use `npm run sync:check` in CI to verify sync consistency.
- Requires Node.js >=24 and the global `@hagicode/skillsbase` CLI; the scripts call `skillsbase` directly.
- Keep the template structure compatible with `skillsbase` CLI expectations.
- This repo serves as the reference template; changes here propagate to derived repositories.

## References

- `README.md`
- `sources.yaml`
- `docs/maintainer-workflow.md`
