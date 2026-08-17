<div align="center">

# Nota

[![Version](https://img.shields.io/badge/version-v0.1.0-blue)](https://github.com/jeremiejt38/nota/releases)
[![Statut](https://img.shields.io/badge/status-alpha-orange)](https://github.com/jeremiejt38/nota)
[![GNOME](https://img.shields.io/badge/GNOME-49%2F50-green)](https://www.gnome.org/)
[![Licence](https://img.shields.io/badge/licence-MIT-lightgrey)](LICENSE.md)

**Extension GNOME Shell pour la prise de notes rapides et le project-tagging — comme des post-it dans la barre supérieure.**

Fork de [Chronomix](https://github.com/zagortenay333/cronomix) dont la partie minuteur/chronomètre a été retirée au profit d'un flux de notes.

</div>

## Introduction

Nota reste accessible d'un clic dans le panneau GNOME. Chaque note est rattachée à un **projet**, ce qui permet de filtrer rapidement les idées, tâches et rappels par contexte. L'extension garde une approche texte libre (markdown-like) mais ajoute des raccourcis visuels pour la priorité et la date d'échéance.

Public visé : utilisateur·rice cherchant un bloc-notes éphémère à portée de main, sans quitter son bureau GNOME.

## Fonctionnalités principales

- **Création rapide** : ouverture depuis le panneau, autocomplétion du projet, validation sur `Entrée`.
- **Taggage par projet** : toute note est associée à un projet existant ou nouveau.
- **Filtre projet** : sélecteur intelligent dans le widget principal pour n'afficher qu'un projet à la fois.
- **Priorité** : boutons Bas / Normal / Élevé (Normal par défaut).
- **Date d'échéance** : ajout rapide d'un `due:` lors de la création.
- **Interface tactile** : boutons et zones cliquables plus larges que l'original.

## Prérequis

- GNOME Shell 49 ou 50.
- GJS / TypeScript uniquement nécessaires pour compiler en local.

## Installation

```bash
git clone https://github.com/jeremiejt38/nota.git
cd nota
./scripts/build
```

Puis redémarrer la session GNOME et activer l'extension via l'application Extensions.

## Développement

```bash
# Éditer les sources TypeScript, puis
tsc --watch
# Dans un autre terminal :
./scripts/restart
./scripts/listen
```

Voir `scripts/build` pour le détail complet du workflow.

## Tests

Le projet n'a pas encore de suite de tests automatisés. Les validations en local portent sur :

- la compilation TypeScript (`tsc --noEmit`) ;
- le chargement de l'extension sans erreur dans `scripts/listen` ;
- la cohérence des fichiers de données et des chaînes de traduction.

## Changelog

Voir [CHANGELOG.md](CHANGELOG.md) et les [releases](https://github.com/jeremiejt38/nota/releases).

## Roadmap vers v0.2.0

- [ ] Améliorer le responsive et l'ergonomie tactile.
- [ ] Synchroniser les projets avec un fichier de configuration utilisateur.
- [ ] Ajouter des raccourcis clavier configurables.

## Contribution

Les contributions passent par des branches courtes et des commits atomiques au format Conventional Commits. Voir `docs/PROJECT_WORKFLOW.md` (généré depuis KSP) pour le détail.

## Crédits

Fork de [Chronomix](https://github.com/zagortenay333/cronomix) par zagortenay333, sous licence MIT.

## Licence

Distribué sous licence MIT. Voir [LICENSE.md](LICENSE.md).
