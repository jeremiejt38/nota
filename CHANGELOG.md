# Changelog

Tous les changements notables de ce projet seront documentés ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/spec/v2.0.0.html).

## [0.2.0](https://github.com/jeremiejt38/nota/compare/v0.1.0...v0.2.0) (2026-08-30)


### Features

* autocomplete project filter, default notes file, and robust build ([b56f708](https://github.com/jeremiejt38/nota/commit/b56f7081fb5430acb3760e3de4e35843bafd2317))
* fork Chronomix into Nota, a project-focused quick notes extension ([6439605](https://github.com/jeremiejt38/nota/commit/6439605eb2948bd40c454e450bf5a120c625940b))
* Nota — project-focused quick notes fork of Chronomix ([13bbf5c](https://github.com/jeremiejt38/nota/commit/13bbf5c7ea27c8a16d75908bd6ca59c1575051c4))


### Bug Fixes

* **build:** compile TypeScript to build/ and copy to extension dir ([7e9130a](https://github.com/jeremiejt38/nota/commit/7e9130a0b91ffc3860d8cfd3350a622fe6018213))
* pomodoro didn't start the task time-tracker ([2621838](https://github.com/jeremiejt38/nota/commit/26218387181315b9d341ecb567dbf295ffef3af2))
* remove invalid package-name from release-please config ([f0b7891](https://github.com/jeremiejt38/nota/commit/f0b78917fa69e90f6b6c24fcab3bdd36e7cb1571))

## [0.1.0] - 2026-08-17

### Initial

- Fork de `zagortenay333/cronomix` renommé `Nota`.
- Suppression des applets minuteur, chronomètre, pomodoro, alarme et flashcards.
- Conservation et adaptation de l'applet Todo en appli de prise de notes rapides.
- Ajout du taggage par projet avec autocomplétion lors de la création d'une note.
- Inversion du raccourci `Entrée` / `Shift+Entrée` : `Entrée` sauvegarde la note, `Shift+Entrée` insère un saut de ligne.
- Ajout d'un sélecteur/filtre par projet dans la vue principale.
- Boutons de priorité (Bas / Normal / Élevé) et champ de date d'échéance rapide.
- Premiers ajustements tactiles (zones de toucher plus larges).
