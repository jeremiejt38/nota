# Plan de réalisation — Nota v0.1.0

Ce document regroupe les phases exécutées pendant les sessions de développement, leur statut et les éléments restants à traiter.

## Plan 1 — Fork et pivot de Chronomix vers Nota

| Phase | Description | Statut | Détails / fichiers concernés |
|-------|-------------|--------|------------------------------|
| 1.1 | Créer le fork `jeremiejt38/nota` | Terminé | Fork de `zagortenay333/cronomix`. Branche de travail : `feature/nota-initial`. PR ouverte : https://github.com/jeremiejt38/nota/pull/1 |
| 1.2 | Cloner et explorer la structure Chronomix | Terminé | Compréhension des modules `src/applets/todo/`, `src/extension.ts`, `src/utils/markup/editor.ts`, `data/themes/`. |
| 1.3 | Initialiser le KSP | Terminé | `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/PROJECT_WORKFLOW.md`, `docs/TESTING.md`, `release-please-config.json`, `.release-please-manifest.json`. |
| 1.4 | Transformer l'orientation temps → notes | Terminé | Renommage `Nota`, suppression des applets alarm/timer/pomodoro/stopwatch/flashcards, conservation du module Todo réorienté Notes. |
| 1.5 | Taggage projet + autocomplétion | Terminé | Autocomplétion des tags `@projet` dans `src/applets/todo/task.ts` et `src/utils/markup/editor.ts`. |
| 1.6 | Comportement Entrée / Shift+Entrée | Terminé | `Entrée` sauvegarde la note, `Shift+Entrée` insère un saut de ligne, sauf si le menu d'autocomplétion est ouvert. |
| 1.7 | Filtre par projet dans le widget | Terminé | Champ de recherche avec suggestions dynamiques dans `src/applets/todo/filter.ts`. |
| 1.8 | Date d'échéance et priorité | Terminé | Boutons Bas/Normal/Élevé (`#3`/`#2`/`#1`) et champ `due:` dans l'éditeur de note. |
| 1.9 | Compatibilité tactile | Terminé | CSS dans `data/themes/dark.css` et `light.css` : boutons, entrées, cases à cocher et cartes plus larges. |
| 1.10 | Fiche Atlas du projet | Terminé | `atlas/projects/nota.md` créé et mis à jour. |

## Plan 2 — Qualité, build et publication

| Phase | Description | Statut | Détails / fichiers concernés |
|-------|-------------|--------|------------------------------|
| 2.1 | Compilation TypeScript | Terminé | `npx tsc` passe sans erreur. Fichier `tsconfig.json` généré par `scripts/build`. |
| 2.2 | Script de build fonctionnel | Terminé | `scripts/build` compile dans `./build` puis copie dans `~/.local/share/gnome-shell/extensions/nota@jeremiejt38`. Gestion du cas où `gettext` est absent. |
| 2.3 | Documentation interne Notes/Projets | Terminé | Mise à jour de `data/docs/todo_tasks` et `data/docs/filters` avec la terminologie notes/projets. |
| 2.4 | Chemin de notes par défaut | Terminé | `~/.config/nota/notes.md` par défaut dans `src/applets/todo/main.ts`. |
| 2.5 | Pousser la branche et créer la PR | Terminé | Branche `feature/nota-initial` poussée, PR #1 ouverte sur `master`. |
| 2.6 | Merge et release v0.1.0 | En attente | Validation par Jérémie, merge de la PR, release générée par Release Please. |

## Plan 3 — Migration Chronomix → Nota

| Phase | Description | Statut | Détails / fichiers concernés |
|-------|-------------|--------|------------------------------|
| 3.1 | Sauvegarde des notes et config | Terminé | Sauvegardes dans `~/todo/backups/` et `~/.config/nota-backups/`. |
| 3.2 | Adapter les notes au format Nota | Terminé | Aucune modification syntaxique nécessaire. Ajout automatique du tag `@akasha-bot` sur les notes sans projet dans `/home/jerem/todo/akasha-bot.md`. |
| 3.3 | Configurer Nota pour utiliser les notes existantes | Terminé | `~/.config/nota/notes.json` pointe vers `/home/jerem/todo/akasha-bot.md`. `~/.config/nota/global.json` active l'applet Notes. |
| 3.4 | Installer l'extension Nota | Terminé | Build et installation dans `~/.local/share/gnome-shell/extensions/nota@jeremiejt38`. |
| 3.5 | Activer Nota dans GNOME | En attente | `enabled-extensions` configuré. Nécessite une déconnexion/reconnexion (session Wayland) pour que l'extension soit visible et chargée. |
| 3.6 | Désactiver Chronomix | En attente | `cronomix@zagortenay333` retiré de `enabled-extensions` ; à vérifier après redémarrage. |

## Éléments restants à traiter

1. **Redémarrage de session GNOME** pour charger Nota (Wayland ⇒ déconnexion/reconnexion requise).
2. **Vérifier le chargement sans erreur** : `journalctl -b 0 /usr/bin/gnome-shell | grep -i nota` après redémarrage.
3. **Merge de la PR #1** et première release `v0.1.0` via Release Please.
4. **Nettoyage du code time-tracker** encore présent mais masqué en surface.
5. **Itérations UX tactiles** après retour d'usage réel sous GNOME 50.
6. **Éventuelle suite de tests automatisés** pour le markup / filtres / éditeur.
