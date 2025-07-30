module.exports = {
    env: {
        browser: true,
        es2020: true,
    },
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['react', 'import'],
    rules: {
        'import/no-unresolved': 'error',
        'import/order': ['warn', {
            'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'pathGroups': [
                {
                    pattern: '@/**',
                    group: 'internal'
                }
            ],
            'alphabetize': { order: 'asc', caseInsensitive: true },
            'newlines-between': 'always'
        }]
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            alias: {
                map: [['@', './src']],
                extensions: ['.js', '.jsx']
            }
        }
    }
}
