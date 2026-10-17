# Contributing to Obsidian's Syncthing Integration Plugin

By participating in this project, you agree to abide by the [code of conduct](CODE_OF_CONDUCT.md).

## Getting Started

To get started with contributing, please follow these steps:

1. Fork the repository and clone it to your local machine.
2. Install any necessary dependencies: `pnpm install`.
3. Create a new branch for your changes: `git checkout -b my-branch-name`.
4. Make your desired changes or additions.
5. Commit your changes using [conventional commits](https://www.conventionalcommits.org/) and follow the [commit message guidelines](https://www.conventionalcommits.org/en/v1.0.0/#summary).
   1. It is recommended to use VS Code's plugin [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits) to help you with this.
   2. Or any other tool that helps you simplify the process of writing conventional commits.
6. Run the tests to ensure everything is working as expected: `pnpm test`.
7. Push to your branch: `git push origin my-branch-name`.
8. Submit a pull request to the `main` branch of the original project's repository.

## Testing

The project has two layers of tests:

- **Unit and component tests** ([`vitest`](https://vitest.dev/)): run them with `pnpm test` (or `pnpm test:watch` while developing, `pnpm test:coverage` for a coverage report). These do not need Obsidian.
- **End-to-end tests** ([`wdio`](https://webdriver.io/) + [`wdio-obsidian-service`][wdio-obsidian-service]): these actually launch Obsidian, load the built plugin, and drive it. They require a build first, so always run `pnpm build` before them.

The end-to-end tests come in two flavors:

- **Smoke tests** (`pnpm test:e2e:smoke`) only need Obsidian and cover core, vault-only features (plugin loading, commands, conflict detection).
- **Full tests** (`pnpm test:e2e`, or just the Syncthing spec with `pnpm test:e2e:syncthing`) additionally talk to a real Syncthing instance through its REST API.

To run the full suite locally, start a disposable Syncthing container and point the tests at it:

```bash
pnpm build          # the e2e tests load the build/ output
pnpm syncthing:up   # start Syncthing (docker compose) with a fixed test API key
pnpm test:e2e       # run all e2e specs
pnpm syncthing:down # stop and clean up
```

The tests read the Syncthing connection from the `SYNCTHING_URL` (default `http://127.0.0.1:8384`) and `SYNCTHING_API_KEY` (default `test-api-key`) environment variables, which match the values in `docker-compose.yml`.

Both flavors also run automatically in CI (see [`.github/workflows/e2e.yml`](workflows/e2e.yml)): a `smoke` job runs the smoke spec, then an `e2e` job spins up a Syncthing container and runs the full suite.

### Keeping `minAppVersion` accurate

`manifest.json`'s `minAppVersion` is the oldest Obsidian version the plugin supports. It is shown to users, and `version-bump.mjs` records it for every release in `versions.json`. Keeping it honest matters, so it is enforced by the e2e tests:

- The **PR gate** (`.github/workflows/e2e.yml`) always tests the declared `minAppVersion` together with the latest Obsidian. If the plugin regresses on its declared floor, the build fails.
- The **Compatibility sweep** (`.github/workflows/compat.yml`) runs the smoke suite against one Obsidian version per minor release, from the oldest testable version up to the latest. Run it manually (`workflow_dispatch`) or wait for the weekly schedule, then look at the results: the lowest version that passes is the real floor.
- `minAppVersion` must be at least `1.0.3` (the oldest version `wdio-obsidian-service` can test). If it is lower, the e2e config falls back to `1.0.3` and prints a warning.

When you start using an Obsidian API that requires a newer version, raise `minAppVersion` in `manifest.json` and run the sweep to confirm the new floor. Never edit past entries in `versions.json` by hand; only the current release's entry is written by `version-bump.mjs`.

## Code Style

<!-- TODO: add the code style guidelines of the project. -->
:construction: Work in progress :construction:

Please make sure to follow the established code style guidelines for this project. Consistent code style helps maintain readability and makes it easier for others to contribute to the project.

To enforce this we use [`husky`][husky] to run [`eslint`](https://eslint.org/) and [`typescript-eslint`](https://typescript-eslint.io/) on every commit.

`husky` is part of our `package.json` file so you should already have it installed. If you don't, you can install the library via npm following the instructions [here][husky_install].

If you are not familiar with the concept of [git hooks](https://git-scm.com/docs/githooks) and/or [`husky`][husky] please read their documentation to understand how they work.

These steps help maintain a consistent code style and prevent unnecessary code style changes in pull requests.

## Issue Tracker

If you encounter any bugs, issues, or have feature requests, please [create a new issue](https://github.com/LBF38/obsidian-syncthing-integration/issues/new) on the project's GitHub repository. Provide a clear and descriptive title along with relevant details to help us address the problem or understand your request.

## Licensing

By contributing to Obsidian's Syncthing Integration Plugin, you agree that your contributions will be licensed under the [LICENSE](../LICENSE) file of the project.

Thank you for your interest in contributing to Obsidian's Syncthing Integration Plugin! We appreciate your support and look forward to your contributions.

[husky]: https://typicode.github.io/husky
[husky_install]: https://typicode.github.io/husky/getting-started.html
[wdio-obsidian-service]: https://github.com/jesse-r-s-hines/wdio-obsidian-service
