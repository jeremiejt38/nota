# Changelog

Tous les changements notables de ce projet seront documentés ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/spec/v2.0.0.html).

## [Unreleased]

### Ajouté

- Sélecteur de projet affiché avant l'éditeur lors de la création d'une note.
- Tri des notes par date de création, de la plus récente à la plus ancienne.

### Modifié

- Filtre par défaut de la vue principale : affiche uniquement les notes non cochées.

### Corrigé

- Filtre par projet : les boutons de projet appliquent correctement le filtre sélectionné.

## [0.1.1] - 2026-08-30

### Corrections

- Ajout du fichier `LICENSE.md` MIT (hérité de Chronomix, copyright étendu).
- Renommage de `readme.md` en `README.md` pour correspondre au standard KSP.

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
