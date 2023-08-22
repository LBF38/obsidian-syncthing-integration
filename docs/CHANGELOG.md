# [2.0.0](https://github.com/LBF38/obsidian-syncthing-integration/compare/1.2.1...2.0.0) (2023-08-22)


### Features

* **ui:** :sparkles: add config table ([#104](https://github.com/LBF38/obsidian-syncthing-integration/issues/104)) ([89b73fd](https://github.com/LBF38/obsidian-syncthing-integration/commit/89b73fd6f7e684802ffc037e4767fe5a2d4311cd))


### BREAKING CHANGES

* **ui:** this changes the SyncthingConfiguration type.

* fix(mobile): :bug: update requestEndpoint to support mobile

update requestEndpoint method to support mobile
by changing the localhost address to its corresponding ip address

* feat(ui): :construction: add config table

* feat(ui): :sparkles: add configuration item component

new component for displaying configuration information from Syncthing.
This will be used to recreate the official Syncthing GUI.

* refactor(ui): :recycle: update obsidian lucide icon component

add all props to be manipulated outside of the component.
It could be used to add styles, classes, etc
to the div element that wraps the SVG.

* feat(ui): :sparkles: add configuration modal

add syncthing configuration modal to reproduce the Syncthing GUI

* feat(ui): :sparkles: update configuration table A LOT

- update configuration item for adding more customization
- create folder item and remote item,
respectively components for folders and remote devices.
- update obsidian lucide icon component with default style
- add configuration item data type inside component/types.ts
These changes are static ! Let's now add some dynamic data !

* feat(controllers): :sparkles: add network calls to get folders/devices

add the API calls to the configuration table so we have dynamic data.
This is awesome ! Now, we have to shape the data in each component.

TODO: refactor models and entities.
They are not 100% accurate to the Syncthing APIs

* feat(ui): :lipstick: update configuration table ui

update folder and remote items to have dynamic data.
update configuration item and table to handle dynamic data.

* refactor(dev): :construction: working on type safety

making functions to dynamically check the type of unknown received json.
(when creating models/entities)
Also trying to make it statically typed.

* refactor(ui): :recycle: update configuration table

refactor types and use of slots inside of the table cells.
might be overcomplicated for what it does.
also should use Svelte stores
for common values such as folders and devices.

* refactor(ui): :recycle: full refactor of syncthing configuration view

refactoring all remote and folder items
inside of the configuration item component.
Also refactoring the configuration table to use the configuration item
give relevant data.

* refactor(controllers): :construction: update requestEndpoint

to follow redirect on HTTPS

* feat(ui): :sparkles: add warning message on configuration view

for next release, to warn that the configuration view isn't fully implemented yet.

## [1.2.1](https://github.com/LBF38/obsidian-syncthing-integration/compare/1.2.0...1.2.1) (2023-08-18)


### Bug Fixes

* **controllers:** :bug: API endpoint calls ([#100](https://github.com/LBF38/obsidian-syncthing-integration/issues/100)) ([45ea294](https://github.com/LBF38/obsidian-syncthing-integration/commit/45ea29499f57aeb51f1abd8c2c99c172fe9fdbcb)), closes [#94](https://github.com/LBF38/obsidian-syncthing-integration/issues/94)

# [1.2.0](https://github.com/LBF38/obsidian-syncthing-integration/compare/1.1.2...1.2.0) (2023-08-03)


### Bug Fixes

* **gh actions:** :green_heart: make it executable! ([3cb71e8](https://github.com/LBF38/obsidian-syncthing-integration/commit/3cb71e893395522cdf793cdb8ca864d34f770233))
* **gh actions:** :green_heart: run script on bash ([61c34fb](https://github.com/LBF38/obsidian-syncthing-integration/commit/61c34fb00d770e4fd41855c60af1a960b94fcce5))


### Features

* **ui:** :sparkles: conflicts per file ([#91](https://github.com/LBF38/obsidian-syncthing-integration/issues/91)) ([271ae57](https://github.com/LBF38/obsidian-syncthing-integration/commit/271ae57150f90f45d4b14076faf3397d554ef327))
* **ui:** :sparkles: merge editor ([#79](https://github.com/LBF38/obsidian-syncthing-integration/issues/79)) ([9147dab](https://github.com/LBF38/obsidian-syncthing-integration/commit/9147dabec5b6e068d94be176a6dc98e4cdc876e2))
* **ui:** ✨ conflicts list modal ([#84](https://github.com/LBF38/obsidian-syncthing-integration/issues/84)) ([401337e](https://github.com/LBF38/obsidian-syncthing-integration/commit/401337e798ed9da4d3ece9e7aff192b340001638))

## [1.1.2](https://github.com/LBF38/obsidian-syncthing-integration/compare/1.1.1...1.1.2) (2023-07-15)


### Bug Fixes

* **gh actions:** :green_heart: fix permissions ([2cc0885](https://github.com/LBF38/obsidian-syncthing-integration/commit/2cc0885433dffd9212fdc03c60b641001de028e4))
* **project:** :ambulance: plugin's compliances for community release ([#67](https://github.com/LBF38/obsidian-syncthing-integration/issues/67)) ([c9683f8](https://github.com/LBF38/obsidian-syncthing-integration/commit/c9683f88dd4e810de5ec4dcb9cc735214a8c1521))

## [1.1.1](https://github.com/LBF38/obsidian-syncthing-integration/compare/1.1.0...1.1.1) (2023-06-25)


### Bug Fixes

* **project:** :ambulance: update plugin id in manifest.json ([81d8f74](https://github.com/LBF38/obsidian-syncthing-integration/commit/81d8f7407367efece32e5ef772364419041e6800))

# [1.1.0](https://github.com/LBF38/obsidian-syncthing-integration/compare/1.0.0...1.1.0) (2023-06-25)


### Features

* **ui:** :lipstick: improve settings tab ui ([#59](https://github.com/LBF38/obsidian-syncthing-integration/issues/59)) ([373a75c](https://github.com/LBF38/obsidian-syncthing-integration/commit/373a75cdce2188a578cb71b69b5d69a128dd369f))

# 1.0.0 (2023-06-25)


### Bug Fixes

* **project:** :twisted_rightwards_arrows: syncthing integration merge ([52023f4](https://github.com/LBF38/obsidian-syncthing-integration/commit/52023f41f242a18e72928c9c1a73a4af98eadc74))
* **ui:** :bug: date format in diff modal ([79d5b40](https://github.com/LBF38/obsidian-syncthing-integration/commit/79d5b405ec8f9205d60f3aaa496483a783c1f914))


### Features

* :construction: cleaned code + add cli cmds ([6ffe319](https://github.com/LBF38/obsidian-syncthing-integration/commit/6ffe319c67c6ad04242428d5a57e2172b729a4ee))
* :sparkles: update manifest ([01d9c85](https://github.com/LBF38/obsidian-syncthing-integration/commit/01d9c854d258e4c53e42d85267100f79d408ea75))
* **controllers:** :sparkles: add implementations ([c05197a](https://github.com/LBF38/obsidian-syncthing-integration/commit/c05197a1a0d2cabd9688eadd637609fb410990a1))
* **data:** :construction: repo implementation ([617cc8e](https://github.com/LBF38/obsidian-syncthing-integration/commit/617cc8e27c558e315dd73bf27c3fb82df0745dab))
* **data:** :sparkles: add local + remote sources ([3857da8](https://github.com/LBF38/obsidian-syncthing-integration/commit/3857da8243ac5aa9381f58868791b988a7b1af6f))
* **dev:** :construction: working on settings page ([3969f34](https://github.com/LBF38/obsidian-syncthing-integration/commit/3969f340b8540ff8d8559c01999233dddc9eabef))
* **dev:** :sparkles: add plugin dev mode ([01c384e](https://github.com/LBF38/obsidian-syncthing-integration/commit/01c384e51e719ecaee3ab69ab77f294c1a3228c9))
* **domain:** :sparkles: add repository interface ([eb0cf2a](https://github.com/LBF38/obsidian-syncthing-integration/commit/eb0cf2a522d582e0debdc69790f9caaf3a588683))
* **domain:** :sparkles: update syncthing entities ([3a6c623](https://github.com/LBF38/obsidian-syncthing-integration/commit/3a6c62311b86dc286082a908556afb09c4448dcd))
* **main:** :sparkles: play with code for creating new features ([d1103c8](https://github.com/LBF38/obsidian-syncthing-integration/commit/d1103c8fc96a2486c6fede665c79ad952ce52528))
* **settings:** :sparkles: add plugin dev mode ([6d4d08a](https://github.com/LBF38/obsidian-syncthing-integration/commit/6d4d08a7d758901dc0d181f5c3a9c8884909ea25))
* **syncthing:** :construction: checking installed ([c1c8bf7](https://github.com/LBF38/obsidian-syncthing-integration/commit/c1c8bf7aa8e3ba35a23970f7419ca2cce8a3a913))
* **syncthing:** :construction: diff modal ([c387cf9](https://github.com/LBF38/obsidian-syncthing-integration/commit/c387cf91bc619e54211dc1804b6df882190e4444))
* **syncthing:** :construction: separating concerns ([61d695d](https://github.com/LBF38/obsidian-syncthing-integration/commit/61d695d627af1eb5d83161464761cde08508290b))
* **syncthing:** :construction: settings & models ([dced247](https://github.com/LBF38/obsidian-syncthing-integration/commit/dced247b211ce45229fcc4461bc3878aa6f34b7b))
* **syncthing:** :construction: update settings ([68e317e](https://github.com/LBF38/obsidian-syncthing-integration/commit/68e317eb04172e3ce238317cf785c93022778d10))
* **syncthing:** :construction: WIP on diff view ([f340c0c](https://github.com/LBF38/obsidian-syncthing-integration/commit/f340c0ce88d703df460279b4321098cfad78eb6f))
* **syncthing:** :construction: work on date types ([56c86e3](https://github.com/LBF38/obsidian-syncthing-integration/commit/56c86e30b121a82223d32128e22e61b449a11607))
* **syncthing:** :construction: work on multiple parts ([24ff762](https://github.com/LBF38/obsidian-syncthing-integration/commit/24ff7623636f89ccfac3230efe068c1d8521bfb1))
* **syncthing:** :lipstick: adding styles.css ([e701c69](https://github.com/LBF38/obsidian-syncthing-integration/commit/e701c69a7e2cd3d6beea17ebc6ea2155baa1eb0c))
* **syncthing:** :lipstick: update conflictsModal ([08aa48a](https://github.com/LBF38/obsidian-syncthing-integration/commit/08aa48a6c194e540505935ec85fe79378d12a8fb))
* **syncthing:** :lipstick: update settings UI ([1c807d0](https://github.com/LBF38/obsidian-syncthing-integration/commit/1c807d0f6e90bffa8f7cda4445d5cb5bf032a705))
* **syncthing:** :necktie: update controller ([1077e1c](https://github.com/LBF38/obsidian-syncthing-integration/commit/1077e1ceb1348a9fb267ee64bf0636b65123371d))
* **syncthing:** :sparkles: add simple api call ([365db7b](https://github.com/LBF38/obsidian-syncthing-integration/commit/365db7ba61ff48daab961cbc4cfd6ff7d9f32469))
* **syncthing:** :sparkles: adding conflict modal ([c06274c](https://github.com/LBF38/obsidian-syncthing-integration/commit/c06274c3cd778e69f811b8b5e234afcaf63e991b))
* **syncthing:** :sparkles: config from cli ([cd00ae4](https://github.com/LBF38/obsidian-syncthing-integration/commit/cd00ae40dfc8b83d683a0eab50750351985591e2))
* **syncthing:** :sparkles: conflicts/diff modals ([4175e85](https://github.com/LBF38/obsidian-syncthing-integration/commit/4175e85125522e57bd69be18d795ac80380f1b33))
* **syncthing:** :sparkles: update entities + models ([b363a69](https://github.com/LBF38/obsidian-syncthing-integration/commit/b363a6911bc512a70c02092e73cdbd2a2e19d6f1))
* **ui:** :construction: buttons logic (diff modal) ([e5dd1ff](https://github.com/LBF38/obsidian-syncthing-integration/commit/e5dd1ff2206ac5d0d875ff9185f60761c39ab2f7))
* **ui:** :construction: diff modal ([8ec1c34](https://github.com/LBF38/obsidian-syncthing-integration/commit/8ec1c348d42af77389e8b2b471d5f660a8ef0890))
* **ui:** :construction: manual edits - diff modal ([5edb3bc](https://github.com/LBF38/obsidian-syncthing-integration/commit/5edb3bc1de170f83bf6b5a3f07360ff8fed9ba20))
* **ui:** :construction: new panes - diff modal ([1e3ad14](https://github.com/LBF38/obsidian-syncthing-integration/commit/1e3ad14084d27ed431a6126ad5e2a8306f341c58))
* **ui:** :construction: update manual edit - diff ([486edeb](https://github.com/LBF38/obsidian-syncthing-integration/commit/486edeb5e681146c613cda9bb2ae3548fcdc61b6))
* **ui:** :construction: wip conflicts modal ([e8dafa4](https://github.com/LBF38/obsidian-syncthing-integration/commit/e8dafa4fc44c29cc2f7c7ee4ae3678427af1fe55))
* **ui:** :lipstick: wip on styles.css ([4471a58](https://github.com/LBF38/obsidian-syncthing-integration/commit/4471a5815c0a1df20dcb0c3cc1ab0862035e2b72))
* **ui:** :sparkles: implement API Status (ping) ([f679a64](https://github.com/LBF38/obsidian-syncthing-integration/commit/f679a64faa2e5cadc9f65cc543720c52b8ddbf90))
