import { PluginSettingTab, App, Setting, Notice } from "obsidian";
import { SyncThingAPI } from "src/data/datasources/syncthing_remote_datasource";
import MyPlugin from "src/main";

export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", {
			text: "SyncThing Integration for Obsidian",
		});
		containerEl.createEl("p", {
			text: "This plugin allows you to sync your vault with SyncThing.\nIt allows you to manage the sync process from within Obsidian.\nYou can only manage the folder you are in.\n\nTo use this plugin, you need to have SyncThing installed on your computer.\n\nYou can find more information about SyncThing here: https://syncthing.net/",
		});

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

		if (!this.plugin.settings.api_key) {
			new Notice("Please set the API key in the settings first.");
			return;
		}
		const syncthingAPI = new SyncThingAPI(
			"http://localhost:8384/",
			this.plugin.settings.api_key // TODO: make it independent and securely stored
		);
		syncthingAPI.getConfiguration().then((config) => {
			console.log(config);
			containerEl.createEl("h2", "SyncThing configuration");
			// modal.contentEl.setText(JSON.stringify(config));
			for (const folder of config.folders) {
				containerEl.createEl("p", {
					text: folder.label,
				});
			}
		});
	}
}
