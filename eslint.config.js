// Règles du projet : ne pas modifier ce fichier (le bot utilise toujours celui de main).
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: [
            'node_modules/',
            'src/static/',
            'data/',
            'coverage/',
            '.github/',
        ],
    },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: { ...globals.node, ...globals.jest },
        },
        rules: {
            eqeqeq: 'error',
            'no-var': 'error',
            'prefer-const': 'error',
        },
    },
];
