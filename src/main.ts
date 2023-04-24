import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { SyncThingAPI } from "./data/syncthing_remote_datasource";

//! Remember to rename these classes and interfaces!

interface MyPluginSettings {
	api_key: string | null;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	api_key: null,
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"cloud",
			"SyncThing status",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				// new Notice("This is a notice about the SyncThing status.");
				if (!this.settings.api_key) {
					new Notice("Please set the API key in the settings first.");
					return;
				}
				const syncthingAPI = new SyncThingAPI(
					"http://localhost:8384/",
					// "cKb2DgeL3yuThq7J9mNquXVGZrbpNDbJ" // (this is my API key for example purposes)
					this.settings.api_key // TODO: make it independent and securely stored
				);
				syncthingAPI.getConfiguration().then((config) => {
					console.log(config);
					const modal = new Modal(this.app);
					// modal.containerEl.createEl("h1", {
					// 	text: "SyncThing configuration",
					// });
					// modal.containerEl.createEl("p", {
					// 	text: JSON.stringify(config),
					// });
					modal.titleEl.setText("SyncThing configuration");
					// modal.contentEl.setText(JSON.stringify(config));
					for (const folder of config.folders) {
						modal.contentEl.createEl("p", {
							text: folder.label,
						});
					}
					modal.open();
				});
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("SyncThing status");
		statusBarItemEl.onClickEvent(() => {
			new Notice("SyncThing integration is not yet implemented.");
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-syncthing-modal",
			name: "Open SyncThing integration modal",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Welcome to SyncThing integration !");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
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
			// "cKb2DgeL3yuThq7J9mNquXVGZrbpNDbJ" // (this is my API key for example purposes)
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
