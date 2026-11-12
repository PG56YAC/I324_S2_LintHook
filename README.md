# I324 – S2 – Linter et hooks

Vous arrivez dans une équipe qui développe une petite application de liste de tâches. Elle fonctionne, les utilisateurs sont contents. Mais personne n'a jamais relu le code avec un outil, et il cache une vingtaine d'erreurs qui finiront par causer des bugs.

Votre travail cette semaine : comprendre comment le projet est construit, nettoyer le code avec un **linter**, puis faire en sorte que plus aucune erreur ne puisse entrer dans le dépôt.

Vous avancez seul, à votre rythme. Après chaque push, un **bot** vous répond par e-mail : il explique ce que vous venez de faire et vous donne la mission suivante.

Dans tout le parcours, `<pseudo>` est votre nom d'utilisateur GitHub **en minuscules**.

## Avant de commencer

Si votre PC n'est pas encore prêt (Git, Node.js, identité Git, notifications), suivez d'abord [INSTALLATION.md](INSTALLATION.md).

## Mission 1 : installer, lancer et faire un premier commit

1. **Cloner** le dépôt dans VS Code (`Ctrl+Shift+P` › **Git: Clone**), avec l'adresse donnée par l'enseignant, puis ouvrir le dossier.
2. **Installer** les dépendances et **lancer** l'application, dans le terminal :
    ```
    npm install
    npm run dev
    ```
    Ouvrez http://localhost:3000 et ajoutez une tâche. Arrêtez ensuite l'application avec `Ctrl+C` dans le terminal.
3. **Créer votre branche** `lint/<pseudo>` à partir de `origin/main` : en bas à gauche, cliquez sur le nom de la branche › **Create new branch from...** › `origin/main`.
4. **Créer votre fichier de réponses** `reponses/<pseudo>.md`, avec ce contenu :
    ```
    # Réponses de <pseudo>

    q1:
    q2:
    q3:
    ```
5. **Commit** avec le message `docs: ajoute ma fiche de réponses`. Ajoutez aussi le fichier `package-lock.json` créé par `npm install`.
6. **Pousser** : bouton **Publish Branch**.

Le bot vous répond quelques secondes plus tard, par e-mail.

## Règles du jeu

- Vous travaillez uniquement sur `lint/<pseudo>`. Les branches des autres ne vous concernent pas.
- Ne modifiez pas `eslint.config.js` : le bot utilise toujours la version de `main`.
- Chaque étape se termine par un commit et un push : sans push, le bot ne voit rien.
- Pas de réponse du bot après une minute ? Regardez l'onglet **Actions** du dépôt, puis demandez à l'enseignant.

---

Application d'origine : [docker/getting-started-app](https://github.com/docker/getting-started-app), licence MIT.
