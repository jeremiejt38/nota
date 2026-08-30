<div align="center">

# Nota

[![Version](https://img.shields.io/badge/version-v0.1.0-blue)](https://github.com/jeremiejt38/nota/releases)
[![Status](https://img.shields.io/badge/status-alpha-orange)](https://github.com/jeremiejt38/nota)
[![GNOME](https://img.shields.io/badge/GNOME-49%2F50-green)](https://www.gnome.org/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE.md)

**A GNOME Shell extension for quick notes and project tagging — like sticky notes in the top panel.**

Forked from [Chronomix](https://github.com/zagortenay333/cronomix) with the timer/stopwatch parts removed in favor of a note-taking flow.

</div>

## Introduction

Nota stays one click away in the GNOME top panel. Every note is tied to a **project**, so you can quickly filter ideas, tasks and reminders by context. The extension keeps a free-text (markdown-like) approach but adds handy shortcuts for priority and due date.

Target audience: anyone who wants an ephemeral notepad at hand without leaving their GNOME desktop.

## Main features

- **Quick capture** : open from the panel, project autocompletion, save with `Enter`.
- **Project tagging** : every note is linked to an existing or new project.
- **Project filter** : smart selector in the main widget to show only one project at a time.
- **Priority** : Low / Normal / High buttons (Normal by default).
- **Due date** : quick `due:` insertion while creating a note.
- **Touch-friendly** : larger buttons and click targets than the original.

## Requirements

- GNOME Shell 49 or 50.
- GJS / TypeScript are only needed to compile locally.

## Installation

```bash
git clone https://github.com/jeremiejt38/nota.git
cd nota
./scripts/build
```

Then restart your GNOME session and enable the extension in the Extensions app.

## Development

```bash
# Edit TypeScript sources, then
tsc --watch
# In another terminal:
./scripts/restart
./scripts/listen
```

See `scripts/build` for the complete workflow.

## Tests

There is no automated test suite yet. Local validation covers:

- TypeScript compilation (`tsc --noEmit`);
- loading the extension without errors via `scripts/listen`;
- data file and translation string consistency.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) and the [releases](https://github.com/jeremiejt38/nota/releases) page.

## Roadmap to v0.2.0

- [ ] Improve responsive and touch ergonomics.
- [ ] Sync projects with a user-defined configuration file.
- [ ] Add configurable keyboard shortcuts.

## Contributing

Contributions use short-lived branches and atomic Conventional Commits. See `docs/PROJECT_WORKFLOW.md` (generated from KSP) for details.

## Credits

Fork of [Chronomix](https://github.com/zagortenay333/cronomix) by zagortenay333, under the MIT license.

## License

Distributed under the MIT license. See [LICENSE.md](LICENSE.md).
