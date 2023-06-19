import { Notice, Plugin } from "obsidian";
import {
	SyncthingController,
	SyncthingControllerImpl,
} from "./controllers/syncthing_controller";
import {
	SyncThingFromCLI,
	SyncThingFromCLIimpl,
} from "./data/syncthing_local_datasource";
import {
	SyncThingFromREST,
	SyncThingFromRESTimpl,
} from "./data/syncthing_remote_datasource";
import { SyncThingConfiguration } from "./models/syncthing_entities";
import { ConflictsModal } from "./views/syncthing_conflicts";
import { SampleSettingTab } from "./views/syncthing_settings_page";
import {
	DevModeModal,
	PluginDevModeController,
} from "./controllers/plugin_dev_mode";

//! Remember to rename these classes and interfaces!

interface MyPluginSettings {
	api_key: string | null;
	configuration: SyncThingConfiguration | null;
	devMode: boolean;
}

const DEFAULT_SETTINGS: Partial<MyPluginSettings> = {
	api_key: null,
	configuration: null,
	devMode: false,
};

export default class MyPlugin extends Plugin {
	settings!: MyPluginSettings;
	syncthingFromCLI: SyncThingFromCLI = new SyncThingFromCLIimpl();
	syncthingFromREST: SyncThingFromREST = new SyncThingFromRESTimpl();
	syncthingController: SyncthingController = new SyncthingControllerImpl(
		this.syncthingFromCLI,
		this.syncthingFromREST,
		this
	);
	devModeController: PluginDevModeController = new PluginDevModeController(
		this
	);

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("SyncThing status");
		statusBarItemEl.onClickEvent(() => {
			new Notice("SyncThing integration is not yet implemented.");
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.addRibbonIcon("construction", "Open Syncthing diff modal", () => {
			new ConflictsModal(this.app, this.syncthingController).open();
		});

		// if (this.settings.devMode) {
		new Notice("Dev mode is enabled.");
		this.addRibbonIcon(
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
		// }
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
