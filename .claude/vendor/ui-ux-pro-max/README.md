# UI UX Pro Max — skill vendorisé

Ce dossier `.claude/skills/` embarque le plugin **UI UX Pro Max** afin qu'il soit
disponible automatiquement pour toutes les sessions Claude Code travaillant sur ce
dépôt (web, desktop, CLI), sans installation manuelle côté client.

## Source
- Dépôt : https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Version du plugin : `2.11.0`
- Commit vendorisé : `b0ebb1797ebc6467fcf3a35f96d768d15faf5120`
- Licence : MIT (voir `LICENSE` dans ce dossier)
- Date d'intégration : 2026-07-31

## Skills fournis
- `ui-ux-pro-max` — moteur principal : base locale de 84 styles, 192 palettes,
  74 pairings de polices, 98 guidelines UX, 25 types de graphiques, 22 stacks.
- `ui-styling` — composants shadcn/ui + Tailwind, rendu canvas (polices `.ttf` incluses).
- `design` — identité de marque, logos, CIP, slides, bannières, icônes.
- `design-system` — architecture de tokens et specs de composants.
- `brand` — voix de marque, identité visuelle, frameworks de messaging.
- `banner-design` — bannières réseaux sociaux / ads / web / print.
- `slides` — présentations HTML stratégiques (Chart.js).

## Mise à jour
Pour mettre à jour, resynchroniser `.claude/skills/` depuis le dépôt source à un
nouveau commit, puis mettre à jour la version et le commit ci-dessus.

## Alternative : installation globale (client perso)
Pour l'avoir dans ton client Claude Code personnel plutôt que par projet :

```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```
