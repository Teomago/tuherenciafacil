import coreWebVitals from 'eslint-config-next/core-web-vitals'
import tseslint from 'typescript-eslint'

/**
 * Next.js 16 flat config — avoid FlatCompat + extends() (ESLint 9 can throw circular JSON).
 * @see https://nextjs.org/docs/app/api-reference/config/eslint
 */
const eslintConfig = [
  ...coreWebVitals,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    ignores: ['.claude/**'],
  },
]

export default eslintConfig
