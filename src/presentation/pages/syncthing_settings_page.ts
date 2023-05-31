import { App, PluginSettingTab, Setting } from "obsidian";
import { SyncThingFromCLIimpl } from "src/data/datasources/syncthing_local_datasource";
import MyPlugin from "src/main";

export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		const syncthingAPI = new SyncThingFromCLIimpl();
		await syncthingAPI.getConfiguration().then((config) => {
			return (this.plugin.settings.configuration = config);
		});

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

		new Setting(containerEl)
			.setName("SyncThing API Key")
			.setDesc("Add your SyncThing API key here for the plugin to work.")
			.addText((text) =>
				text
					.setPlaceholder("Enter your API key here...")
					.setValue(this.plugin.settings.api_key ?? "")
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.api_key = value;
						await this.plugin.saveSettings();
					})
			);

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
		// syncthingAPI
		// 	.getConfiguration()
		// 	.then((config) => {
		// 		console.log("Settings Page : Configuration");
		// 		console.log(config.version);
		// 		for (const folder of config.folders) {
		// 			new Setting(containerEl)
		// 				.setName(folder.label)
		// 				.addToggle((button) => null);
		// 		}
		// 		for (const device of config.devices) {
		// 			new Setting(containerEl)
		// 				.setName(device.name ?? device.deviceID)
		// 				.addToggle((button) => null);
		// 		}
		// 		this.plugin.settings.configuration = config;
		// 	})
		// 	.catch((err) => {
		// 		containerEl.createEl("h2", "SyncThing configuration");
		// 		containerEl.createEl("p", {
		// 			text: "Could not connect to SyncThing. Please check your API key and make sure SyncThing is running.",
		// 		});
		// 	});
	}
}
