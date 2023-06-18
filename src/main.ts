import { App, Modal, Notice, Plugin } from "obsidian";
import {
	SyncthingController,
	SyncthingControllerImpl,
} from "./controllers/main_controller";
import {
	DevModeModal,
	PluginDevModeController,
} from "./controllers/plugin_dev_mode";
import {
	SyncThingFromCLI,
	SyncThingFromCLIimpl,
} from "./data/syncthing_local_datasource";
import {
	SyncThingFromREST,
	SyncThingFromRESTimpl,
} from "./data/syncthing_remote_datasource";
import { SyncThingConfiguration } from "./models/entities";
import { ConflictsModal } from "./views/conflicts_modal";
import { SyncthingSettingTab } from "./views/settings_tab";

//! Remember to rename these classes and interfaces!

interface SyncthingPluginSettings {
	api_key: string;
	configuration: SyncThingConfiguration | Partial<SyncThingConfiguration>;
	devMode: boolean;
}

const DEFAULT_SETTINGS: Partial<SyncthingPluginSettings> = {
	configuration: { syncthingBaseUrl: "http://localhost:8384" },
	devMode: false,
};

export default class SyncthingPlugin extends Plugin {
	static loadCount = 0;
	settings!: SyncthingPluginSettings;
	pluginsElements: HTMLElement[] = [];
	syncthingFromCLI: SyncThingFromCLI = new SyncThingFromCLIimpl();
	syncthingFromREST: SyncThingFromREST = new SyncThingFromRESTimpl(this);
	syncthingController: SyncthingController = new SyncthingControllerImpl(
		this.syncthingFromCLI,
		this.syncthingFromREST,
		this
	);
	devModeController: PluginDevModeController = new PluginDevModeController(
		this
	);

	async onload() {
		SyncthingPlugin.loadCount++;
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("SyncThing status");
		statusBarItemEl.onClickEvent(() => {
			new Notice("SyncThing integration is not yet implemented.");
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		const pluginSettingTab = new SyncthingSettingTab(this.app, this);
		if (SyncthingPlugin.loadCount === 1)
			this.addSettingTab(pluginSettingTab);

		const syncthingConflictManager = this.addRibbonIcon(
			"construction",
			"Open Syncthing conflict manager modal",
			() => {
				new ConflictsModal(this.app, this.syncthingController).open();
			}
		);

		// Plugin's Dev mode
		if (this.settings.devMode) {
			new Notice("Dev mode is enabled.");
			const devModeGenerator = this.addRibbonIcon(
				"chevron-right-square",
				"Generate Syncthing conflicts",
				async () => {
					new DevModeModal(
						this.app,
						new PluginDevModeController(this)
					).open();
				}
			);
			this.addCommand({
				id: "generate-syncthing-conflicts",
				name: "Generate Syncthing conflicts",
				icon: "chevron-right-square",
				callback: async () => {
					new DevModeModal(
						this.app,
						new PluginDevModeController(this)
					).open();
				},
			});
			this.pluginsElements.push(devModeGenerator);
		}

		// Add test Modal to ribbon
		const test = this.addRibbonIcon("star", "Test Modal", () =>
			new TestModal(this.app, this).open()
		);

		// Plugin's HTML elements to be removed on unload
		this.pluginsElements.push(
			statusBarItemEl,
			syncthingConflictManager,
			test
		);
	}

	onunload(): void {
		this.pluginsElements.forEach((element) => element.remove());
	}

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

class TestModal extends Modal {
	private iframe: HTMLIFrameElement;
	constructor(app: App, public plugin: SyncthingPlugin) {
		super(app);
		this.iframe = document.createElement("iframe");
	}

	async onOpen() {
		if (!this.plugin.settings.api_key) {
			new Notice("API key is not set.");
			return;
		}
		const syncthingGUI = await fetch(
			this.plugin.settings.configuration.syncthingBaseUrl ??
				"http://localhost:8384",
			{
				headers: {
					"X-API-Key": this.plugin.settings.api_key ?? "",
					// "Access-Control-Allow-Origin": "*", // Required for CORS support to work
				},
				mode: "cors",
			}
		);
		if (syncthingGUI.status >= 400) {
			new Notice("Syncthing is not running.");
			return;
		}
		console.log(syncthingGUI);

		this.contentEl.createEl("h2", { text: "Syncthing Configuration" });

		// Create the collapsible element
		const collapsible = this.contentEl.createEl("details");
		const summary = collapsible.createEl("summary", {
			text: "Syncthing Connection Properties",
			attr: {
				style: `
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #2196F3;
      color: white;
      padding: 10px;
      border-radius: 5px;
      cursor: pointer;
      user-select: none;
    `,
			},
		});
		summary.createEl("span", {
			text: "+",
			attr: {
				style: `
      margin-right: 10px;
      font-size: 1.2em;
      font-weight: bold;
    `,
			},
		});

		// Create the container for the tiles
		const tileContainer = collapsible.createEl("div");

		// Add the properties as tiles
		addTile(tileContainer, "Status", syncthingGUI.status.toString());
		addTile(
			tileContainer,
			"Base URL",
			this.plugin.settings.configuration.syncthingBaseUrl ?? ""
		);

		function addTile(
			container: HTMLElement,
			label: string,
			value: string,
			color1 = "#4CAF50",
			color2 = "#2196F3"
		) {
			const tile = container.createEl("div", {
				attr: {
					style: `background-color: ${color1}; color: white; padding: 10px; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3); margin-bottom: 10px;`,
				},
			});
			tile.createEl("div", {
				text: label,
				attr: { style: "font-weight: bold; margin-bottom: 5px;" },
			});
			tile.createEl("div", { text: value });

			// Alternate between two colors
			const lastTile = container.lastElementChild as HTMLElement;
			if (lastTile) {
				const lastColor = lastTile.style.backgroundColor;
				tile.style.backgroundColor =
					lastColor === color1 ? color2 : color1;
			}
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
