// import ObsidianLogo from "assets/Obsidian_software_logo.svg";
// import SyncthingLogo from "assets/syncthing-logo-horizontal.svg";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { SyncthingController } from "src/controllers/main_controller";
import SyncthingPlugin from "src/main";
import { Failure } from "src/models/failures";
import { ObsidianLogo, SyncthingLogo } from "./logos";

export class SyncthingSettingTab extends PluginSettingTab {
	plugin: SyncthingPlugin;
	syncthingController: SyncthingController;

	constructor(app: App, plugin: SyncthingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.syncthingController = plugin.syncthingController;
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();
		// TODO: Add banner with the logo.
		const banner = containerEl.createEl("p");
		const link = banner.createEl("a", {
			attr: {
				href: "https://github.com/lbf38/obsidian-syncthing-integration",
			},
		});
		const syncthingImg = containerEl.createEl("img", {
			attr: {
				src: SyncthingLogo,
			},
		});
		const obsidianImg = containerEl.createEl("img", {
			attr: {
				src: ObsidianLogo,
			},
		});
		syncthingImg.style.height = "100px";
		obsidianImg.style.height = "100px";
		banner.style.alignContent = "center";
		link.append(syncthingImg, obsidianImg);
		banner.append(link);

		// Check if Syncthing is installed.
		const hasSyncthing = await this.syncthingController.hasSyncThing();
		if (!hasSyncthing) {
			containerEl.createEl("h1", { text: "Syncthing is not installed." });
			containerEl
				.createEl("p", {
					text: "Please install Syncthing at the following URL: ",
				})
				.append(
					containerEl.createEl("a", {
						text: "https://syncthing.net/downloads",
						href: "https://syncthing.net/downloads",
					})
				);
			return;
		}

		// Get the Syncthing configuration from CLI or API.
		const configuration = await this.syncthingController.getConfiguration();
		if (configuration instanceof Failure) {
			containerEl.createEl("h2", {
				text: "Error getting configuration. Please try again later.",
			});
			return;
		}
		this.plugin.settings.configuration = configuration;

		containerEl.createEl("h1", {
			text: "SyncThing Integration for Obsidian",
		});
		containerEl
			.createEl("p", {
				text: "This plugin allows you to sync your vault with SyncThing.\nIt allows you to manage the sync process from within Obsidian.\nYou can only manage the folder you are in.\n\nTo use this plugin, you need to have SyncThing installed on your computer.\n\nYou can find more information about SyncThing here: ",
			})
			.appendChild(
				containerEl.createEl("a", {
					text: "https://syncthing.net/",
					href: "https://syncthing.net/",
				})
			);

		// API Key setting.
		const apiKeySetting = new Setting(containerEl);
		apiKeySetting
			.setName("SyncThing API Key")
			.setDesc("Add your SyncThing API key here for the plugin to work.")
			.addText(
				(text) =>
					(text
						.setPlaceholder("Enter your API key here...")
						.setValue(this.plugin.settings.api_key ?? "")
						.onChange(async (value) => {
							// console.log("Secret: " + value);
							this.plugin.settings.api_key = value;
							await this.plugin.saveSettings();
						}).inputEl.type = "password")
				// TODO: add a button to show the api key in clear text.
			);

		if (!this.plugin.settings.api_key) {
			apiKeySetting.addButton((button) => {
				button.setButtonText("Get API Key").onClick(async () => {
					this.syncthingController.getAPIKey().then((key) => {
						if (key instanceof Failure) {
							new Notice(key.message);
							return;
						}
						this.plugin.settings.api_key = key;
						this.plugin.saveSettings();
						this.display();
					});
				});
			});
		}

		// Trying to make an HTTP request to the API.
		new Setting(containerEl)
			.setName("SyncThing API Status")
			.addButton((button) => {
				button.setButtonText("Check API Status").onClick(async () => {
					this.syncthingController
						.getAPIStatus()
						.then((status) => {
							new Notice(`Syncthing Ping : ${status}`);
						})
						.catch((error) => {
							new Notice(error);
						});
				});
			});

		// TEST : difference between file.basename and file.name in Obsidian API.
		// const file = this.app.vault.getFiles()[0];
		// containerEl.createEl("h1", { text: "TEST" });
		// containerEl.createEl("p", { text: "file.basename: " + file.basename });
		// containerEl.createEl("p", { text: "file.name: " + file.name });
		// ! file.basename : file name without extension
		// ! file.name : file name with extension

		containerEl.createEl("h1", { text: "Syncthing Configuration" });
		containerEl.createEl("h2", { text: "This Device" });
		const thisDeviceTable = containerEl
			.createEl("table", {
				text: "This table will show the folders and devices that are configured on this device.",
			})
			.appendChild(containerEl.createEl("tbody"));
		const thisDeviceConfig = configuration.devices[0];
		thisDeviceTable
			.appendChild(containerEl.createEl("tr"))
			.appendChild(containerEl.createEl("td", { text: "Device ID" }))
			.appendChild(
				containerEl.createEl("td", {
					text: thisDeviceConfig.deviceID.slice(0, 8),
				})
			);

		// Plugin's dev Mode.
		containerEl.createEl("h1", { text: "Developer Mode" });
		new Setting(containerEl)
			.setName("Enable Plugin's Developer Mode")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.devMode)
					.onChange(async (value) => {
						this.plugin.settings.devMode = value;
						await this.plugin.saveSettings();
						this.plugin.onunload();
						this.plugin.onload();
					});
			});
	}
}
