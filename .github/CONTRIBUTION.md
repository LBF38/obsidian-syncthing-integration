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
6. Push to your branch: `git push origin my-branch-name`.
7. Submit a pull request to the `main` branch of the original project's repository.
<!-- 5. Run the tests to ensure everything is working as expected. -->

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
