import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        rules: {
            // 🔧 Personalizações:
            '@typescript-eslint/no-explicit-any': 'off', // desativa só essa regra
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            'react-hooks/exhaustive-deps': 'warn', // mantém hooks sob aviso
            'no-console': 'off', // útil pra debug local
        },
    },
])
