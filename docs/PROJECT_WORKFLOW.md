# Project Workflow

This repository follows the **Kit Standards Projet (KSP)**.

- `main` is always stable and deployable.
- All work happens in short-lived branches: `feature/*`, `fix/*`, `docs/*`, `refactor/*`, `test/*`, `chore/*`.
- Commits are atomic and follow [Conventional Commits](https://www.conventionalcommits.org/).
- Releases are managed by Release Please from `CHANGELOG.md` and the version source in `data/metadata.json`.
- Pull requests are rebased onto `main` and merged with a fast-forward.
- After merge, the feature branch is deleted.
