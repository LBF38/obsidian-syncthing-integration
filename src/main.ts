import { Notice, Platform, Plugin, addIcon } from "obsidian";
import { SyncthingController } from "./controllers/main_controller";
import {
	DevModeModal,
	PluginDevModeController,
} from "./controllers/plugin_dev_mode";
import { SyncthingStatusBar } from "./controllers/status_bar";
import { SyncthingFromAndroid } from "./data/syncthing_android_datasource";
import { SyncthingFromCLI } from "./data/syncthing_local_datasource";
import { SyncthingFromREST } from "./data/syncthing_remote_datasource";
import { SyncthingConfiguration } from "./models/entities";
import { ConflictsModal } from "./views/conflicts_modal";
import { SyncthingLogoSVG } from "./views/logos";
import { SyncthingSettingTab } from "./views/settings_tab";

interface SyncthingPluginSettings {
	api_key: string;
	gui_username: string;
	gui_password: string;
	configuration: SyncthingConfiguration | Partial<SyncthingConfiguration>;
	devMode: boolean;
}

const DEFAULT_SETTINGS: Partial<SyncthingPluginSettings> = {
	configuration: {
		url: {
			protocol: "http",
			ip_address: "localhost",
			port: 8384,
		},
	},
	devMode: false,
};

export default class SyncthingPlugin extends Plugin {
	static loadCount = 0;
	settings!: SyncthingPluginSettings;
	pluginsElements: HTMLElement[] = [];
	syncthingFromCLI: SyncthingFromCLI = new SyncthingFromCLI();
	syncthingFromREST: SyncthingFromREST = new SyncthingFromREST(this);
	syncthingFromAndroid: SyncthingFromAndroid = new SyncthingFromAndroid();
	syncthingController: SyncthingController = new SyncthingController(
		this.syncthingFromCLI,
		this.syncthingFromREST,
		this.syncthingFromAndroid,
		this
	);
	devModeController: PluginDevModeController = new PluginDevModeController(
		this
	);
	statusBar?: SyncthingStatusBar;

	async onload() {
		// For devMode issue. (adding/removing commands when loading/unloading plugin)
		SyncthingPlugin.loadCount++;
		await this.loadSettings();

		// Load Syncthing icon
		addIcon("syncthing", SyncthingLogoSVG);

		// Status bar. Does not work on mobile apps.
		if (!Platform.isMobileApp) {
			this.statusBar = new SyncthingStatusBar(this.addStatusBarItem(), this);
			this.statusBar.onload();
			this.pluginsElements.push(this.statusBar.status_bar);
		}

		// Settings tab
		const pluginSettingTab = new SyncthingSettingTab(this.app, this);
		if (SyncthingPlugin.loadCount === 1)
			this.addSettingTab(pluginSettingTab);

		const syncthingConflictManager = this.addRibbonIcon(
			"syncthing",
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
		this.pluginsElements.push(syncthingConflictManager);
	}

	onunload(): void {
		this.statusBar?.onunload();
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
