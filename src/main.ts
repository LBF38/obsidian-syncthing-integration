import * as iframeResizer from "iframe-resizer";
import { App, Modal, Notice, Plugin, requestUrl } from "obsidian";
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
		const syncthingGUI = await requestUrl({
			url: this.plugin.settings.configuration.syncthingBaseUrl + "",
			headers: {
				"X-API-Key": this.plugin.settings.api_key,
				"Access-Control-Allow-Origin": "*", // Required for CORS support to work
			},
		});
		if (syncthingGUI.status >= 400) {
			new Notice("Syncthing is not running.");
			return;
		}
		console.log(syncthingGUI);

		this.contentEl.createEl("h2", { text: "Syncthing Configuration" });

		// Create the iframe element
		this.iframe = this.contentEl.createEl("iframe", {
			attr: {
				src: this.plugin.settings.configuration.syncthingBaseUrl + "/",
				frameborder: "0",
				allowfullscreen: "true",
				innerWidth: "100%",
				innerHeight: "100%",
			},
		});
		// this.iframe.srcdoc = syncthingGUI.text;

		// Initialize the iframe resizer
		iframeResizer.iframeResizer(
			{
				log: false,
				checkOrigin: false,
				heightCalculationMethod: "taggedElement",
				scrolling: true,
			},
			this.iframe
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
