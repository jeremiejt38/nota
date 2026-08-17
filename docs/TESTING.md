# Testing

## Validation commands

```bash
# Typecheck TypeScript sources
tsc --noEmit

# Build the extension locally
./scripts/build

# Listen for runtime errors after loading in GNOME Shell
./scripts/listen
```

## Before merging

- Run `tsc --noEmit` without errors.
- Ensure `./scripts/build` completes successfully.
- Check that no translation template or metadata file is left inconsistent.
- Update `CHANGELOG.md` and `README.md` if the change is user-facing.
