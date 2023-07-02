import { Notice, Plugin } from "obsidian";
import {
	SyncthingController,
	SyncthingControllerImpl,
} from "./controllers/main_controller";
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
import {
	DevModeModal,
	PluginDevModeController,
} from "./controllers/plugin_dev_mode";

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
		// For devMode issue. (adding/removing commands when loading/unloading plugin)
		SyncthingPlugin.loadCount++;
		await this.loadSettings();

		// Status bar. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("SyncThing status");
		statusBarItemEl.onClickEvent(() => {
			new Notice("SyncThing integration is not yet implemented.");
		});

		// Settings tab
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
		this.pluginsElements.push(statusBarItemEl, syncthingConflictManager);
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
