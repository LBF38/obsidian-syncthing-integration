import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { SyncthingController } from "src/controllers/syncthing_controller";
import MyPlugin from "src/main";
import { Failure } from "src/models/failures";

export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;
	syncthingController: SyncthingController;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.syncthingController = plugin.syncthingController;
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();

		// TODO: Add banner with the logo.
		// containerEl
		// 	.createEl("img", {
		// 		attr: {
		// 			src: "assets/syncthing-logo-horizontal.svg",
		// 		},
		// 	})
		// 	.appendChild(
		// 		containerEl.createEl("img", {
		// 			attr: {
		// 				src: "assets/obsidian_software_logo.svg",
		// 			},
		// 		})
		// 	);

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

		containerEl.empty();

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
		new Setting(containerEl)
			.setName("SyncThing API Key")
			.setDesc("Add your SyncThing API key here for the plugin to work.")
			.addText((text) =>
				text
					.setPlaceholder("Enter your API key here...")
					.setValue(this.plugin.settings.api_key ?? "")
					.onChange(async (value) => {
						// console.log("Secret: " + value);
						this.plugin.settings.api_key = value;
						await this.plugin.saveSettings();
					})
			);

		// Trying to make an HTTP request to the API.
		new Setting(containerEl)
			.setName("SyncThing API Status")
			.addButton((button) => {
				button.setButtonText("Check API Status").onClick(async () => {
					const status =
						await this.syncthingController.getAPIStatus();
					new Notice(status);
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
		const thisDeviceConfig = this.plugin.settings.configuration?.devices[0];
		if (thisDeviceConfig) {
			thisDeviceTable
				.appendChild(containerEl.createEl("tr"))
				.appendChild(containerEl.createEl("td", { text: "Device ID" }))
				.appendChild(
					containerEl.createEl("td", {
						text: thisDeviceConfig.deviceID.slice(0, 8),
					})
				);
		}

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
						this.plugin.load();
					});
			});
	}
}
