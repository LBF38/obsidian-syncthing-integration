<p align=center>
 <a href="https://github.com/lbf38/obsidian-syncthing-integration">
  <img src="assets/syncthing-logo-horizontal.svg" height=100>
  <img src="assets/Obsidian_software_logo.svg" height=100>
 </a>
 <h1 align=center>Obsidian SyncThing integration</h1>
</p>

This plugin allows you to synchronize your Obsidian vault with a remote device using [Syncthing](https://syncthing.net/).

## :label: Badges

<!-- ignore markdownlint rule below -->
<!-- markdownlint-disable MD051 -->
[![All Contributors](https://img.shields.io/github/all-contributors/lbf38/obsidian-syncthing-integration?color=ee8449&style=flat-square)](#✨-contributors)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/lbf38/obsidian-syncthing-integration?logo=github&color=ee8449&style=flat-square)](https://github.com/LBF38/obsidian-syncthing-integration/releases/latest)
[![Obsidian plugin release](https://img.shields.io/badge/Obsidian%20plugin%20release-purple?logo=obsidian&style=flat-square)](https://obsidian.md/plugins?id=obsidian-syncthing-integration)
[![Join the Community : GitHub Discussions badge](https://img.shields.io/badge/Join%20the%20community-on%20GitHub%20Discussions-blue?style=flat-square)][discussions]
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release&style=flat-square)](https://github.com/semantic-release/semantic-release)

## :link: Useful links

### Related softwares

- [Syncthing](https://syncthing.net/)
- [Obsidian](https://obsidian.md/)

### Plugin's related links

- [Roadmap](docs/ROADMAP.md)
- [GH Discussions][discussions]

## :arrow_down: Installation

You can install the plugin using the following ways :

- From the community plugins tab within Obsidian
- From the [releases page](https://github.com/lbf38/obsidian-syncthing-integration/releases) on GitHub
- From the source code, please see [the Development section](#🛠️-development)
- With [Obsidian42 BRAT](https://github.com/TfTHacker/obsidian42-brat)

### Guides

The best way to install the plugin is via the Obsidian Community Plugins tab. You can find a guide on how to do this [here](https://help.obsidian.md/Extending+Obsidian/Community+plugins).

Otherwise, you can download the latest release from the [releases page](https://github.com/lbf38/obsidian-syncthing-integration/releases) on GitHub. Then, you can install the plugin manually by downloading the `main.js`, `manifest.json` and `styles.css` files and placing them in your vault's `.obsidian/plugins/obsidian-syncthing-integration` folder.

If you want to install the plugin from the source code, please see [the Development section](#🛠️-development).

Finally, you can install the plugin with [Obsidian42 BRAT](https://github.com/TfTHacker/obsidian42-brat) and provide the GitHub repository URL. Please see the [BRAT documentation](https://tfthacker.com/Obsidian+Plugins+by+TfTHacker/BRAT+-+Beta+Reviewer's+Auto-update+Tool/Quick+guide+for+using+BRAT)

## :wrench: Configuration

:construction: This plugin is still in development. The configuration might not yet be fully available. :construction:

> **Warning**
> Please backup your vault and use this plugin wisely. Some features could modify files in your vault so please always remember to backup your vault in a different location.

The plugin should work out-of-the-box, but you can configure it by going to the plugin settings. The main objective of this plugin is to provide a complete integration of SyncThing functionalities into the Obsidian app. Therefore, you don't have to rely on other apps to synchronize your vault. You only have to open the Obsidian app on the devices you want to synchronize and the plugin will take care of the rest.

The integration would interact with Syncthing using the CLI or the REST API. And the main objective is to handle all the vault synchronization process from the Obsidian app. Therefore, you don't have to open the Syncthing app on your devices to synchronize your vault.

However, it doesn't aim to manage multiple folders synced with Syncthing. The idea is to have the control over the Syncthing synchronization from the vault's settings. Feel free to synchronize other folders with Syncthing, but the plugin will only manage the vault's folder. All the plugin's features will only work on the vault's folder (for the conflict/diff modals and the settings).

> **Warning**
> The synchronization is done in real-time, using peer-to-peer connections. Therefore, all the devices you want to synchronize must be connected at the same time.

## :heart: Contributing

To contribute to this plugin, you can create [issues] and [pull requests] on GitHub. Moreover, you can discuss any new idea or suggestion in the [Discussions tab][discussions].
Please follow the [Code of Conduct](.github/CODE_OF_CONDUCT.md) when contributing to this project and read the [Contributing guidelines](.github/CONTRIBUTION.md).

## :hammer_and_wrench: Development

If you want to develop this plugin locally, please follow the instructions below.

1. Clone the repository
2. Install the dependencies using `pnpm install`
3. Build the plugin using `pnpm dev`
4. (Optional) Use the [hot-reload plugin](https://github.com/pjeby/hot-reload) in Obsidian to reload the plugin automatically when you make changes

> **Note**
> When using the hot-reload plugin, you have to clone this plugin in the `.obsidian/plugins` folder of your vault.
> And the plugin's files should be at the root of the folder. (`main.js`, `manifest.json` and `styles.css`)
> It should be automatically set up.

## :clap: Credits

Here are some inspirations for this plugin :

- [Obsidian version history diff by kometenstaub](https://github.com/kometenstaub/obsidian-version-history-diff) - credits for :
  - the [`styles.scss`](src/styles.scss) file,
  - corresponding [`esbuild` SCSS/CSS config](esbuild.config.mjs),
  - and an overall inspiration for the diff modal layout, when resolving file conflicts.
- [Obsidian testing vault by pedersen](https://github.com/pedersen/obsidian-testing-vault) - credits for :
  - the plugin's dev mode feature. I added a dev mode modal to easily generate testing files w/ syncthing conflicts format.

## :busts_in_silhouette: Authors

- [@LBF38](https://github.com/lbf38)

## :sparkles: Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## :memo: Licensing

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for more information.

[issues]: https://github.com/lbf38/obsidian-syncthing-integration/issues/new/choose
[pull requests]: https://github.com/lbf38/obsidian-syncthing-integration/compare
[discussions]: https://github.com/lbf38/obsidian-syncthing-integration/discussions
