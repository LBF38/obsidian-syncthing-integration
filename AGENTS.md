# Repository Guidelines

This document provides guidelines for contributors and AI agents working on this project. It covers project structure, build/test commands, coding style, commit conventions, and other important information.

## Project Overview

Obsidian Syncthing Integration is a TypeScript/Svelte plugin that integrates Syncthing features into Obsidian. The plugin allows managing synchronization conflicts, viewing diffs, and connecting to Syncthing instances.

## Key Technologies

- **Language**: TypeScript (ESNext target, strict mode enabled)
- **Framework**: Svelte 5
- **Build Tool**: esbuild with esbuild-svelte
- **Package Manager**: pnpm (v9 used in CI, see workflows)
- **Linting**: ESLint with @typescript-eslint and eslint-plugin-svelte
- **Type Checking**: tsc with `-noEmit -skipLibCheck`
- **Code Style**: EditorConfig (tabs, 4 spaces width, LF line endings)
- **Obsidian API**: obsidian v1.12.3

## Project Structure

```
.
├── src/                    # Source code
│   ├── components/         # Reusable Svelte components
│   ├── controllers/        # Business logic controllers
│   ├── data/               # Data sources (CLI, REST API, Android)
│   ├── models/             # TypeScript types/classes (entities)
│   ├── views/              # UI views/modals/settings tabs (Svelte)
│   ├── styles/             # Styles
│   ├── main.ts             # Main plugin entry point
│   └── styles.scss         # Main SCSS
├── build/                  # Build output (generated)
├── docs/                   # Documentation
├── .github/                # GitHub workflows and templates
├── .zed/                   # Zed editor project settings & tasks
├── esbuild.config.mjs      # Build configuration
├── tsconfig.json           # TypeScript configuration
├── .eslintrc               # ESLint configuration
├── .editorconfig           # EditorConfig
├── flake.nix               # Nix dev shell (Node + pnpm)
├── .envrc                  # direnv entrypoint (use flake)
├── manifest.json           # Obsidian plugin manifest
├── versions.json           # Version mapping
└── AGENTS.md               # This file
```

## Build and Development Commands

All commands use `pnpm` as the package manager.

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Build in development/watch mode (runs esbuild with watch) |
| `pnpm build` | Full build: runs lint (tsc + eslint) then production build |
| `pnpm lint` | Run type checking and linting (`tsc -noEmit -skipLibCheck && eslint . --ext .ts,.svelte src`) |
| `pnpm release` | Create a release using semantic-release (CI only) |
| `pnpm browsers` | Update browserslist DB |

**Important**: When working on this codebase, you MUST run `pnpm lint` to verify your changes pass type checking and linting. This is the same check run in CI.

### Reproducible dev environment (Nix + direnv)

A `flake.nix` provides Node 22 + pnpm (matching CI) via a dev shell. With [direnv](https://direnv.net/) (and the [nix-direnv](https://github.com/nix-community/nix-direnv) extension recommended) installed, `direnv allow` activates it automatically when entering the repo. Otherwise use `nix develop` manually. `flake.lock` is committed for reproducibility.

## Coding Style and Conventions

> [!TODO]
> No code formatter (e.g. Prettier) is configured yet, so editors should not format on save. Wiring up a shared formatter and enabling format-on-save is a planned improvement.

### TypeScript

- **Strict mode** is enabled (`"strict": true`, `"strictNullChecks": true`)
- Use TypeScript types everywhere - avoid `any` when possible (though `@typescript-eslint/no-explicit-any` is not explicitly disabled; follow existing patterns)
- Use explicit types for function parameters and return types when clarity helps
- Follow existing class/interface patterns in `src/models/`
- Import order: follow existing style in files (external deps first, then internal modules)

### Svelte

- Use Svelte 5 syntax (the codebase is migrating to Svelte 5 - see commit b6f2f81)
- Files use `.svelte` extension
- ESLint configured with `eslint-plugin-svelte` and `svelte-eslint-parser`
- Follow existing component patterns in `src/components/` and `src/views/`

### Code Style Rules

- **Comments sparingly** - Comments are reserved for exposed types/functions (when truly required) and documentation. Only add a comment when it brings real value; avoid them otherwise. Match the existing JSDoc/inline comment style when you do.
- Use tabs for indentation (4 spaces width as per EditorConfig). Never use spaces for indentation.
- LF line endings
- No trailing whitespace (enforced by EditorConfig conceptually)
- Files must end with a newline
- Follow naming conventions from existing code: PascalCase for classes/components/types, camelCase for variables/functions
- **No unused variables**: `@typescript-eslint/no-unused-vars` errors if unused (with exception for `args` parameter - unused args are allowed)
- Avoid `@ts-comment` (ban-ts-comment is off but use sparingly)
- Avoid `no-prototype-builtins` issues and empty functions (rules relaxed where needed)

### General Guidelines

- **Never assume libraries**: Always check if a library is already used in the codebase before adding dependencies. Look at package.json, neighboring files, or imports.
- **Mimic existing patterns**: When creating/editing, look at surrounding code for style, naming, and framework usage.
- **Security**: Never log or expose secrets/keys. Never commit secrets.
- **Minimal output**: When working with agents, be concise - follow the instruction to keep responses under 4 lines unless detail requested.
- **NO new files proactively**: Don't create documentation files (*.md) unless explicitly requested. Don't create new files unless explicitly required.
- **Read before editing**: You must read existing files before editing them.

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

- Commits must follow the conventional commit format
- Use VS Code extension "Conventional Commits" or similar if needed (recommended in CONTRIBUTING.md)
- Husky commit-msg hook runs `commitlint --edit "$1"` to validate
- Only commit when explicitly requested by the user

Common scopes (from .vscode/settings.json): `README`, `syncthing`, `dev`, `deps`, `ui`, `esbuild`, `controllers`, `models`, `settings`, `project`, `gh actions`, `release`, `mobile`

## Pull Requests

Keep PR descriptions short, efficient, and concise. State clearly what the PR brings; include only the necessary information and avoid filler text.

## Testing

There are currently no explicit test scripts or test framework configured in package.json (comment says "Need to add tests for this to work #49" in CI). Do not assume specific test commands. Check README or codebase for testing approach. If tests are added, follow the project's patterns.

## Linting and Type Checking Requirements

Before completing any task that modifies code:
1. Run `pnpm lint` to ensure type checking and linting pass
2. Fix any errors or warnings introduced by your changes
3. Only mark work as complete after verification passes

If you cannot find the correct command, ask the user.

## Obsidian Plugin Specific Notes

- Plugin ID is "syncthing-integration" (see manifest.json)
- Supports both desktop and mobile (`isDesktopOnly: false`)
- Builds to `build/main.js`, `build/styles.css` via esbuild
- Main entry point is `src/main.ts` extending Obsidian's `Plugin` class
- Uses Obsidian API types from `obsidian` package
- Hot reload is supported in development via the hot-reload plugin (as noted in README)

## Working with this Repository

- The codebase is in a git repo
- Default branch is `master` (see release workflow)
- When creating PRs, follow guidelines in `.github/CONTRIBUTION.md`
- Be respectful and follow the Code of Conduct

## AI Agent Instructions

When working on this repository:
1. **Understand first**: Read relevant files to understand conventions before making changes
2. **Follow existing patterns**: Mimic code style, utilities, and patterns in the codebase
3. **Verify changes**: Always run lint/typecheck after code modifications
4. **Be concise**: Keep responses minimal per the system instructions
5. **No unnecessary files**: Only create files when explicitly required
6. **Reference code locations**: When pointing to code, use `file_path:line_number` format when helpful
7. **Respect the codebase**: This is an established project with specific conventions - follow them precisely
8. **No proactive commits**: Never commit unless explicitly requested by the user

## Questions?

If you have doubts about conventions, tooling, or implementation details for this specific repo, don't hesitate to ask the user. They want clarification on any uncertainties.
