<!-- Managed by skillsbase CLI. -->

# Maintainer Workflow

The template maintainer flow is `sync -> test -> drift check`.

## Lifecycle

1. `npm install --global @hagicode/skillsbase`
2. `npm ci`
3. `npm run sync`
4. `npm test`
5. `npm run sync:check`

## Remote source contract

The default skill source is the remote GitHub reference `HagiCode-org/cli@hagi`.

The template repository does not commit an in-repo skill source copy. `skillsbase sync` reads the `hagi` skill from the upstream repository at sync time.

## Validation

- `npm run sync` rebuilds the managed output via `skillsbase sync --repo .`
- `npm run sync:check` validates drift via `skillsbase sync --check --repo .`
- `npm test` validates the baseline, manifest, default `hagi` skill, and repo-local command contract
- The remote-source design depends on network access; offline environments cannot rebuild the default skill

## Non-Interactive Flow

CI and other non-interactive environments should run:

```bash
npm install --global @hagicode/skillsbase
npm ci
npm test
npm run sync:check
```

## Notes

- `sources.yaml` is the single source of truth
- `HagiCode-org/cli@hagi` is the default remote source for the managed skill
- `skills/hagi/` and `.skill-source.json` are managed outputs and should not be edited by hand
- The GitHub Actions workflow and composite action are still generated from the official `skillsbase` templates
