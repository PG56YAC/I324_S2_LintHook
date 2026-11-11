// Bot « Lint et hooks » (I324) : répond à l'élève qui vient de pousser sur lint/<pseudo>.
// Chaque réponse explique ce qui vient d'être fait, puis donne la mission suivante.
// Node.js + git uniquement. Le linter utilisé est celui de main (dépendances installées par le workflow).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const RACINE = process.cwd(); // checkout de main, avec node_modules
const git = (...a) => { try { return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const existe = (ref) => !!ref && git('rev-parse', '--verify', '--quiet', ref + '^{commit}') !== null;
const ancetre = (a, b) => { try { execFileSync('git', ['merge-base', '--is-ancestor', a, b], { stdio: 'ignore' }); return true; } catch { return false; } };
const lire = (ref, f) => git('show', `${ref}:${f}`);

// Réponses du quiz, stockées sous forme d'empreintes
const normaliser = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[`'"]/g, '').replace(/\s+/g, ' ').trim();
const empreinte = (t) => crypto.createHash('sha256').update(normaliser(t)).digest('hex');
const QUIZ = {
    q1: ['ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'],
    q2: ['3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'],
    q3: ['9db3f780def6105eee3cc930de4d0982607760820fddaa3facdd3813ccb40628'],
};
// Renvoie la forme de la réponse qui correspond (ou null)
const quizJuste = (q, v) => (v ? [v, 'npm ' + v, String(v).replace(/[).]/g, '')].find((x) => QUIZ[q].includes(empreinte(x))) || null : null);

// L'explication qui suit le quiz donne les réponses : elle est chiffrée, seules les bonnes réponses permettent de la lire
const BILANS = [
    "wQNVfSF8KIt6gchPBXv+thrG8mh9lxXao9Frwdpzqeh6Q8X1dQD/19pNo6hcJ6E/O+sohW7LNFki94VUgoB/MnluJ2AvLZKVZQGRN4YlSbDiAUkUj2QR70HBJ6E+i/tI1+2COHuAAaB2vHRRfzkM1CXGhDlqCEdjtTR2HyIz8HZrxSQGDd8WX1Ro+3pnm+26aXY524y6uMzGBEppRts7eT43ZYDhcyVfhulovrVW3q+lIeu/IzByQlZOerjHc7n1R85Qbnqct5Kdcao1l7qR8df/5wxz8aoUBWKyRS4CEwMT/bHoH0cDKtZ82l1B2CQ9QcS6aVuRyVRRRVMIiAGC1DAI2vHIKVwzQ2OMb7WQBvrK+qmPq3IQwCVNCf77ZXq7XtKlw6O8Qt7QVtq/KGZDLlWVzx4klVrJ7qx/6fQDmD8MuhAuZaUnyXNUO4QBlb+7FDUpjRDba/0JXjEFTmBavOB32RwiDRLPQAGPCvoqNQCs6b/R14FU7YsSty1J8zpaVN7T76rEKNdvT13VQEpBHYGawffnggbN5gXT7W+wv/xYH/TcxRFX8M+GxC3ErMyavXlwZFKbmK8TsjmEjLCg9UNANUJ1RmqkrsenFHXNxHFftay2qoHVzUfRFP16SDtcYUO4frpIOMS2Uk9xWWrlsJTyERZWX/kjomQsPfesz4ArtPQKKuWMIMfWKWeSfgX47NpD9npmMXt9a9MGhoUI3FJ9ipzaqrxXpWLEGlgNQCsanJW5ME9s551lIUau5mjCMwTyoJDXYJdrDj9Pr2ShbWyL+SLVwAA0vckt9y/wBH4V/J8wodwwrbaP8dzSSHgO/Pi/y4dS3GYKZgW4xctzn5HZ3bYoQziikcpq4CfGSk7RX2lj42BORPSdtiW0HVztbhLEQe8SXB3gpNCpbRTSJgTXmsns0ilPoA1XY+ZkHwBOwjGZTnT527+YLvGCbHjfhKQIwxMN8Jiuau5AQ0qG84Ptm0tZjA=="
];
function dechiffrer(i, secret) {
    const b = Buffer.from(BILANS[i], 'base64');
    const cle = crypto.createHash('sha256').update('I324:' + normaliser(secret)).digest();
    const d = crypto.createDecipheriv('aes-256-gcm', cle, b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8'));
}

const AIDE = {
    'no-unused-vars': 'une variable est déclarée mais jamais utilisée : supprimez-la.',
    eqeqeq: 'utilisez `===` ou `!==` : `==` convertit les types avant de comparer, ce qui donne des surprises.',
    'no-var': 'remplacez `var` par `const` (ou `let` si la valeur change).',
    'prefer-const': 'cette variable ne change jamais : déclarez-la avec `const`.',
    'no-unreachable': 'ce code ne sera jamais exécuté (il suit un `return`) : supprimez-le.',
    'no-empty': 'un bloc vide cache une erreur : traitez-la (au moins un `console.error`) ou supprimez le bloc.',
    'no-dupe-keys': 'la même clé apparaît deux fois dans l\'objet : gardez-en une.',
    'no-self-assign': 'une variable est assignée à elle-même : cette ligne ne sert à rien.',
    'no-constant-condition': 'la condition est toujours vraie : le `if` est inutile.',
    'no-dupe-else-if': 'la même condition est testée deux fois : la deuxième branche ne s\'exécutera jamais.',
    'no-useless-catch': 'ce `catch` relance simplement l\'erreur : le `try/catch` est inutile.',
    'no-undef': 'cette variable n\'existe pas : vérifiez son nom.',
};

// Lance ESLint (config de main, commentaires eslint-disable ignorés) sur src/ et spec/ d'une référence
function linter(ref) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-'));
    const archive = execFileSync('git', ['archive', ref, 'src', 'spec'], { maxBuffer: 50e6 });
    execFileSync('tar', ['-x', '-C', tmp], { input: archive });
    fs.copyFileSync(path.join(RACINE, 'eslint.config.js'), path.join(tmp, 'eslint.config.js'));
    fs.symlinkSync(path.join(RACINE, 'node_modules'), path.join(tmp, 'node_modules'), 'dir');
    let sortie;
    try {
        sortie = execFileSync(path.join(RACINE, 'node_modules', '.bin', 'eslint'),
            ['--no-inline-config', '-f', 'json', 'src', 'spec'], { cwd: tmp, encoding: 'utf8', maxBuffer: 50e6 });
    } catch (e) {
        sortie = e.stdout;
        if (!sortie) throw new Error('ESLint n\'a pas pu s\'exécuter : ' + String(e.stderr).slice(0, 300));
    }
    const erreurs = [];
    for (const f of JSON.parse(sortie)) {
        for (const m of f.messages) {
            if (m.severity === 2) erreurs.push({ fichier: path.relative(tmp, f.filePath).replace(/\\/g, '/'), ligne: m.line, regle: m.ruleId || 'syntaxe', message: m.message });
        }
    }
    return erreurs;
}
const indice = (e) => `\`${e.fichier}\`, ligne ${e.ligne}, règle \`${e.regle}\` : ${AIDE[e.regle] || e.message}`;

// ---------------------------------------------------------------------------------------------
// Les missions. Pour chacune :
//   consigne : ce qu'il faut faire (envoyé quand la mission commence)
//   verifier : contrôle sur le contenu de la branche, renvoie { ok, aide }
//   bilan    : ce que l'élève vient d'apprendre (envoyé quand la mission est réussie)
// ---------------------------------------------------------------------------------------------
const MISSIONS = [
    {
        titre: 'Installer, lancer et faire un premier commit',
        consigne: (p) => [
            'Suivez la mission 1 du README.',
        ],
        verifier: (c) => {
            if (!c.depuisMain) return { ok: false, aide: 'Votre branche ne part pas de `main` : supprimez-la et recréez-la depuis `origin/main`.' };
            if (c.reponses === null) return { ok: false, aide: `Le fichier \`reponses/${c.pseudo}.md\` est introuvable sur votre branche. Vérifiez le nom du dossier et du fichier (pseudo en minuscules).` };
            return { ok: true };
        },
        bilan: () => [
            'Votre application tourne et votre premier commit est arrivé. Ce que vous avez fait sans y penser :',
            '`npm install` a lu le fichier `package.json`, a téléchargé tous les paquets listés dans `node_modules/`, puis a écrit les versions exactes installées dans `package-lock.json`.',
            'Le dossier `node_modules/` n\'est jamais commité (regardez le `.gitignore`) : n\'importe qui peut le recréer avec `npm install`. Par contre, `package-lock.json` doit être commité, c\'est lui qui garantit que tout le monde a les mêmes versions.',
        ],
    },
    {
        titre: 'Comprendre les dépendances',
        consigne: (p) => [
            'Ouvrez `package.json` et répondez aux trois questions dans votre fichier `reponses/' + p + '.md`, sur les lignes `q1:`, `q2:` et `q3:`.',
            '',
            '- **q1** : combien de paquets sont listés dans `devDependencies` ? Répondez par un nombre.',
            '- **q2** : on lit `"eslint": "^10.14.0"`. Quelles versions npm a-t-il le droit d\'installer ? Répondez par une lettre.',
            '  - a) uniquement 10.14.0',
            '  - b) 10.14.0 ou plus récente, tant qu\'elle commence par 10',
            '  - c) n\'importe quelle version plus récente, même 11.0.0',
            '  - d) toujours la toute dernière version publiée',
            '- **q3** : sur un serveur de CI, on veut installer exactement les versions de `package-lock.json`, sans jamais rien mettre à jour. Quelle commande npm utilise-t-on ?',
            '',
            'Indice pour q1 : `dependencies`, c\'est ce dont l\'application a besoin pour tourner. `devDependencies`, ce sont les outils du développeur (tests, linter…), inutiles en production.',
        ],
        verifier: (c) => {
            const r = c.reponses || {};
            const faux = ['q1', 'q2', 'q3'].filter((q) => !quizJuste(q, r[q]));
            if (!faux.length) { c.secretQuiz = ['q1', 'q2', 'q3'].map((q) => normaliser(quizJuste(q, r[q]))).join('|'); return { ok: true }; }
            const vides = faux.filter((q) => !r[q]);
            return { ok: false, aide: vides.length === faux.length ? `Il manque une réponse sur la ligne ${vides.map((q) => '`' + q + ':`').join(', ')}.`
                : `${faux.length === 1 ? 'La réponse' : 'Les réponses'} ${faux.map((q) => '`' + q + '`').join(', ')} ${faux.length === 1 ? 'n\'est pas juste' : 'ne sont pas justes'}.`
                + (faux.includes('q3') ? ' Pour q3 : une commande de deux lettres après `npm`, très utilisée dans les pipelines.' : '') };
        },
        bilan: (c) => dechiffrer(0, c.secretQuiz),
    },
    {
        titre: 'Le linter, première passe',
        consigne: () => [
            'Le code de l\'application fonctionne, mais il cache une vingtaine d\'erreurs. Un **linter** les trouve sans même lancer l\'application. Ce projet utilise ESLint, déjà installé (il fait partie des `devDependencies`).',
            '',
            'Dans le terminal de VS Code, à la racine du projet :',
            '```',
            'npx eslint .',
            '```',
            '`npx` lance un outil installé dans `node_modules/`, sans rien installer de plus. Le point veut dire « tout le projet ».',
            '',
            'Chaque ligne indique le fichier, la ligne, le problème et, à la fin, le nom de la règle. **Corrigez au moins 10 erreurs**, relancez la commande pour vérifier, puis commit et push.',
            'Ne touchez pas à `eslint.config.js` et n\'utilisez pas de commentaire `eslint-disable` : le bot ne les prend pas en compte.',
        ],
        verifier: (c) => {
            const r = c.lint();
            if (c.total - r.length >= 10) return { ok: true };
            return { ok: false, aide: `Vous en avez corrigé ${Math.max(0, c.total - r.length)} sur les 10 demandées. La suivante : ${indice(r[0])}` };
        },
        bilan: (c) => [
            'Vous venez de voir ce qu\'un linter attrape : des variables oubliées, des `==` qui convertissent les types, du code qui ne s\'exécutera jamais. Rien de tout ça ne fait planter l\'application aujourd\'hui, mais chacune de ces lignes est un bug qui attend son heure.',
            'Le linter lit le code, il ne l\'exécute pas. Les règles sont choisies par l\'équipe dans `eslint.config.js` : ouvrez-le, vous y verrez `eqeqeq`, `no-var` et `prefer-const`, en plus des règles recommandées.',
        ],
    },
    {
        titre: 'Zéro erreur',
        consigne: (p, c) => [
            `Il vous reste **${c.lint().length} erreurs**. Continuez avec \`npx eslint .\` jusqu'à ce que la commande ne signale plus rien.`,
            '',
            'Si une règle vous paraît obscure, cherchez son nom sur https://eslint.org/docs/latest/rules/ : chaque règle a sa page avec un exemple de mauvais et de bon code.',
        ],
        verifier: (c) => {
            const r = c.lint();
            return r.length ? { ok: false, aide: `Encore ${r.length}. La suivante : ${indice(r[0])}` } : { ok: true };
        },
        bilan: () => [
            'Plus une seule erreur. Dans une équipe, c\'est la règle du jeu : le linter doit être vert avant que le code parte sur GitHub.',
            'Le problème, c\'est qu\'il faut penser à le lancer. Et un jour, quelqu\'un oubliera. Les trois prochaines missions servent à ne plus jamais dépendre de la mémoire de quelqu\'un.',
        ],
    },
    {
        titre: 'Un script npm pour le linter',
        consigne: () => [
            'Taper `npx eslint .` à chaque fois, c\'est long et chacun le fait à sa façon. Les projets npm définissent leurs commandes dans `package.json`, section `"scripts"`. Vous en utilisez déjà : `npm run dev`, `npm test`.',
            '',
            'Ouvrez `package.json` et ajoutez la ligne `"lint"` dans la section `"scripts"` :',
            '```json',
            '"scripts": {',
            '    "dev": "nodemon -L src/index.js",',
            '    "start": "node src/index.js",',
            '    "test": "jest",',
            '    "lint": "eslint ."',
            '},',
            '```',
            'Attention à la virgule ajoutée après `"jest"` : dans un JSON, chaque ligne d\'une section se termine par une virgule, sauf la dernière.',
            '',
            'Vérifiez que toute l\'équipe peut maintenant taper :',
            '```',
            'npm run lint',
            '```',
            'Puis commit et push.',
        ],
        verifier: (c) => {
            if (!c.pkg) return { ok: false, aide: '`package.json` n\'est plus un JSON valide : vérifiez les virgules et les guillemets.' };
            return /eslint/.test(c.scripts.lint || '') ? { ok: true } : { ok: false, aide: 'Dans `package.json`, section `"scripts"`, ajoutez la ligne `"lint": "eslint ."`.' };
        },
        bilan: () => [
            'Un script, c\'est un raccourci partagé : la commande est écrite une seule fois, dans le dépôt, et tout le monde lance la même chose. C\'est aussi ce que lancera un pipeline de CI : `npm run lint`, `npm test`.',
        ],
    },
    {
        titre: 'Un hook pre-commit avec husky',
        consigne: () => [
            'Git sait lancer un programme à certains moments : avant un commit, avant un push, après un merge… Ce sont les **hooks**. Si le programme échoue, Git annule l\'action.',
            '',
            'Le souci : les hooks de Git vivent dans `.git/hooks/`, qui n\'est jamais partagé. **husky** règle ça : les hooks sont rangés dans un dossier `.husky/` versionné avec le projet, et husky les installe automatiquement chez chaque personne qui lance `npm install`.',
            '',
            'Installez husky et préparez le dossier :',
            '```',
            'npm install --save-dev husky',
            'npx husky init',
            '```',
            '`husky init` crée le fichier `.husky/pre-commit` (qui contient `npm test`) et ajoute le script `"prepare": "husky"` dans `package.json`.',
            '',
            'Remplacez le contenu de `.husky/pre-commit` par :',
            '```',
            'npm run lint',
            '```',
            'Sous Windows, regardez en bas à droite de VS Code (ou de WebStorm) : le fichier doit être en **LF**, pas en **CRLF**. Cliquez dessus pour changer, sinon le hook plante avec une erreur bizarre.',
            'Puis testez : ajoutez volontairement `var x = 1;` dans un fichier et essayez de faire un commit. Il doit être refusé. Retirez la ligne, faites le commit et poussez.',
        ],
        verifier: (c) => {
            const pre = c.lireFichier('.husky/pre-commit');
            if (!c.dev.husky) return { ok: false, aide: 'husky n\'apparaît pas dans les `devDependencies` : `npm install --save-dev husky`, puis commitez `package.json` et `package-lock.json`.' };
            if (!/husky/.test(c.scripts.prepare || '')) return { ok: false, aide: 'Le script `"prepare": "husky"` manque dans `package.json` : lancez `npx husky init`.' };
            if (pre === null) return { ok: false, aide: 'Le fichier `.husky/pre-commit` est introuvable sur votre branche : lancez `npx husky init` et commitez le dossier `.husky`.' };
            if (!/npm run lint|eslint/.test(pre)) return { ok: false, aide: 'Le fichier `.husky/pre-commit` doit lancer `npm run lint`.' };
            return { ok: true };
        },
        bilan: () => [
            'Le linter se lance maintenant tout seul, avant chaque commit, chez tous ceux qui clonent le projet. Plus besoin d\'y penser.',
            'Le script `prepare` est la clé : npm le lance automatiquement à la fin de chaque `npm install`. C\'est lui qui active les hooks de husky chez un nouveau venu, sans qu\'il ait rien à faire.',
            'Un hook reste un contrôle local : on peut le contourner avec `git commit --no-verify`. C\'est pour ça qu\'on refera ces mêmes contrôles côté serveur, dans la CI. Le hook sert à attraper l\'erreur tôt, la CI à garantir que rien ne passe.',
        ],
    },
    {
        titre: 'Un hook commit-msg avec commitlint',
        consigne: () => [
            'La semaine passée, le bot vérifiait vos messages de commit (`feat:`, `fix:`, `docs:`…). Ces conventions s\'appellent les **Conventional Commits**. On va maintenant faire faire ce contrôle par votre propre PC, avant même que le commit existe.',
            '',
            '**commitlint** lit un message et vérifie qu\'il respecte ces conventions. Le hook `commit-msg` le lance juste après que vous avez écrit votre message.',
            '',
            '1. Installez commitlint et les règles conventionnelles :',
            '```',
            'npm install --save-dev @commitlint/cli @commitlint/config-conventional',
            '```',
            '2. Créez à la racine le fichier `commitlint.config.mjs` :',
            '```js',
            'export default { extends: [\'@commitlint/config-conventional\'] };',
            '```',
            '3. Créez le fichier `.husky/commit-msg` :',
            '```',
            'npx --no -- commitlint --edit $1',
            '```',
            'Sous Windows, regardez en bas à droite de VS Code (ou de WebStorm) : ce fichier aussi doit être en **LF**, pas en **CRLF**. Cliquez dessus pour changer, sinon le hook plante avec une erreur bizarre.',
            'Testez avec un message comme `correction` : le commit doit être refusé. Puis faites un vrai commit, par exemple `build: ajoute commitlint`, et poussez.',
        ],
        verifier: (c) => {
            const msg = c.lireFichier('.husky/commit-msg');
            const cfg = ['commitlint.config.mjs', 'commitlint.config.js', 'commitlint.config.cjs', '.commitlintrc', '.commitlintrc.json', '.commitlintrc.js']
                .some((f) => c.lireFichier(f) !== null) || !!(c.pkg && c.pkg.commitlint);
            if (!c.dev['@commitlint/cli'] || !c.dev['@commitlint/config-conventional']) return { ok: false, aide: 'Il manque `@commitlint/cli` ou `@commitlint/config-conventional` dans les `devDependencies`.' };
            if (!cfg) return { ok: false, aide: 'Le fichier `commitlint.config.mjs` est introuvable à la racine.' };
            if (msg === null || !/commitlint/.test(msg)) return { ok: false, aide: 'Le fichier `.husky/commit-msg` doit contenir `npx --no -- commitlint --edit $1`.' };
            return { ok: true };
        },
        bilan: () => [
            'Deux hooks, deux moments : `pre-commit` vérifie le **code** avant le commit, `commit-msg` vérifie le **message**. Le `$1` est le fichier temporaire où Git a rangé votre message, commitlint le lit et dit oui ou non.',
            'Pourquoi tant d\'efforts sur des messages ? Parce que des outils les lisent : ils peuvent calculer la prochaine version (un `feat` augmente le mineur, un `fix` le correctif) et écrire le changelog tout seuls. Ça ne marche que si tout le monde respecte le format.',
        ],
    },
    {
        titre: 'Formater avec Prettier (bonus)',
        consigne: () => [
            'Le linter cherche les erreurs. Le **formateur** s\'occupe de la mise en forme : indentation, guillemets, points-virgules, longueur des lignes. Plus aucun débat sur les espaces dans l\'équipe : l\'outil décide pour tout le monde.',
            '',
            '1. Installez Prettier :',
            '```',
            'npm install --save-dev prettier',
            '```',
            '2. Créez à la racine un fichier `.prettierrc` avec vos choix, par exemple :',
            '```json',
            '{ "singleQuote": true, "tabWidth": 4 }',
            '```',
            '3. Ajoutez dans la section `"scripts"` de `package.json` la ligne `"format": "prettier --write ."` (comme pour `lint` à la mission 5), lancez `npm run format`, puis commit et push.',
            '',
            'Regardez le diff avant de commiter : Prettier a reformaté beaucoup de fichiers, sans changer ce que fait le code.',
        ],
        verifier: (c) => {
            if (!c.dev.prettier) return { ok: false, aide: 'Prettier n\'apparaît pas dans les `devDependencies`.' };
            if (!['.prettierrc', '.prettierrc.json', 'prettier.config.js', 'prettier.config.mjs', '.prettierrc.js'].some((f) => c.lireFichier(f) !== null)) return { ok: false, aide: 'Le fichier `.prettierrc` est introuvable à la racine.' };
            if (!/prettier/.test(c.scripts.format || '')) return { ok: false, aide: 'Il manque le script `"format": "prettier --write ."`.' };
            return { ok: true };
        },
        bilan: () => [
            'Linter et formateur se complètent : l\'un attrape les bugs, l\'autre uniformise le style. Dans VS Code comme dans WebStorm, on peut aussi demander à Prettier de formater à chaque sauvegarde.',
        ],
    },
];

// Évalue les missions sur une référence, dans l'ordre, et s'arrête à la première ratée
function evaluer(ref, pseudo, racine, total) {
    let p = null;
    try { p = JSON.parse(lire(ref, 'package.json') || 'null'); } catch { p = null; }
    let rep = null;
    const t = lire(ref, `reponses/${pseudo}.md`);
    if (t !== null) {
        rep = {};
        for (const l of t.split(/\r?\n/)) {
            const m = /^\s*[-*]?\s*\**(q[0-9])\**\s*:\s*(.*)$/i.exec(l);
            if (m) rep[m[1].toLowerCase()] = m[2].trim();
        }
    }
    let cache = null;
    const c = {
        pseudo, total, pkg: p, reponses: rep,
        dev: (p && p.devDependencies) || {}, scripts: (p && p.scripts) || {},
        depuisMain: !!racine && ancetre(racine, ref),
        lireFichier: (f) => lire(ref, f),
        lint: () => (cache = cache || linter(ref)),
    };
    let reussies = 0;
    let aide = '';
    for (const m of MISSIONS) {
        const r = m.verifier(c);
        if (!r.ok) { aide = r.aide || ''; break; }
        reussies++;
    }
    return { reussies, aide, c };
}

function main() {
    const acteur = process.env.ACTEUR;
    const pseudo = acteur.toLowerCase();
    const ref = (process.env.REF || '').replace('refs/heads/', '');
    const avant = process.env.AVANT || '';
    const res = { commentaire: '' };
    const nul = !avant || /^0+$/.test(avant);

    // Pas de nouveau commit dans ce push : pas de réponse
    const nouveaux = git('log', '--format=%H', nul ? `origin/main..origin/${ref}` : `${avant}..origin/${ref}`);
    if (!nouveaux) { fs.writeFileSync(process.env.SORTIE, JSON.stringify(res)); return; }

    const L = [`@${acteur}`, ''];
    if (ref !== `lint/${pseudo}`) {
        L.push(`La branche \`${ref}\` ne correspond à rien ici : je ne regarde que \`lint/${pseudo}\` (pseudo en minuscules). Renommez-la ou recréez-la depuis \`origin/main\`.`);
        res.commentaire = L.join('\n');
        fs.writeFileSync(process.env.SORTIE, JSON.stringify(res));
        return;
    }

    const racine = (git('rev-list', '--max-parents=0', 'origin/main') || '').split('\n')[0];
    const total = linter('origin/main').length;
    const apres = evaluer(`origin/${ref}`, pseudo, racine, total);
    const avantEtat = !nul && existe(avant) ? evaluer(avant, pseudo, racine, total).reussies : 0;
    const n = MISSIONS.length;

    L.push(`**Progression : ${apres.reussies} sur ${n}**`, '');

    if (apres.reussies > avantEtat) {
        for (let i = avantEtat; i < apres.reussies; i++) {
            L.push(`### Mission ${i + 1} réussie : ${MISSIONS[i].titre}`, '', ...MISSIONS[i].bilan(apres.c).flatMap((x) => [x, '']));
        }
        if (apres.reussies === n) {
            L.push('### Terminé', '', 'Toutes les missions sont réussies, bonus compris. Montrez ce message à votre enseignant.');
        } else {
            const m = MISSIONS[apres.reussies];
            L.push(`### Mission ${apres.reussies + 1} : ${m.titre}`, '', ...m.consigne(pseudo, apres.c), '');
        }
    } else if (apres.reussies === n) {
        L.push('Toutes les missions sont déjà réussies. Rien de nouveau à vérifier.');
    } else {
        const m = MISSIONS[apres.reussies];
        L.push(`### Mission ${apres.reussies + 1} : pas encore`, '', `> ${apres.aide}`, '',
            '<details><summary>Rappel de la consigne</summary>', '', ...m.consigne(pseudo, apres.c), '', '</details>', '');
    }
    if (apres.reussies < n) L.push('_Chaque étape se termine par un commit et un push : sans push, je ne vois rien._');

    res.commentaire = L.join('\n');
    fs.writeFileSync(process.env.SORTIE, JSON.stringify(res));
    if (process.env.AFFICHER) console.log(res.commentaire);
}

main();
