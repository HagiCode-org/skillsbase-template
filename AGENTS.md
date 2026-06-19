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
- `skillsbase.yaml`: skillsbase source configuration

## Agent Guidelines

- Use `npm run sync` to refresh managed skill output; never edit `skills/` manually.
- Use `npm run sync:check` in CI to verify sync consistency.
- Keep the template structure compatible with `skillsbase` CLI expectations.
- This repo serves as the reference template; changes here propagate to derived repositories.

## References

- `README.md`
- `skillsbase.yaml`
