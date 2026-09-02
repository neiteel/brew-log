import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier/flat"
import checkFile from "eslint-plugin-check-file"

const eslintConfig = [
  {
    // Vendored agent tooling. Already gitignored, but ESLint's flat config
    // does not read .gitignore, so `pnpm lint` was reporting ~2.4k errors
    // from code this project does not own or ship.
    ignores: [
      ".claude/skills/**",
      ".agents/skills/**",
      ".github/skills/**",
      ".codex/**",
    ],
  },
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "prefer-arrow-callback": ["error"],
      "prefer-template": ["error"],
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/**/!(__tests__)": "KEBAB_CASE",
        },
      ],
    },
  },
]

export default eslintConfig
