import { Command, Notice, Plugin, addIcon } from "obsidian";
import { SyncthingController } from "./controllers/main_controller";
import {
	DevModeModal,
	PluginDevModeController,
} from "./controllers/plugin_dev_mode";
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

type DevModeType = {
	ribbonIcon: HTMLElement;
	command: Command;
}

export default class SyncthingPlugin extends Plugin {
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
	devMode: DevModeType | undefined;

	async onload() {
		await this.loadSettings();

		// Load Syncthing icon
		addIcon("syncthing", SyncthingLogoSVG);

		// Status bar. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Syncthing status");
		statusBarItemEl.onClickEvent(() => {
			new Notice("Syncthing integration is not yet implemented.");
		});

		// Settings tab
		const syncthingSettingTab = new SyncthingSettingTab(this.app, this);
		this.addSettingTab(syncthingSettingTab);
		// Syncthing Conflict Manager
		const syncthingConflictManager = this.addRibbonIcon(
			"syncthing",
			"Open Syncthing conflict manager modal",
			() => {
				new ConflictsModal(this.app, this.syncthingController).open();
			}
		);

		this.devModeSwitch();
		this.pluginsElements.push(statusBarItemEl, syncthingConflictManager);
	}

	onunload(): void {
		if (this.devMode) {
			console.log("SyncthingPlugin: Dev mode disabled.");
			this.unloadDevMode(this.devMode);
		}
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

	removeCommand(id: string) {
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(this.app as any).commands.removeCommand(commandId`${this.manifest.id}:${id}`);
	}

	devModeSwitch() {
		if (this.settings.devMode) {
			console.log("Dev mode enabled.");
			this.devMode = this.loadDevMode();
		} else if (this.devMode) {
			console.log("Dev mode disabled.");
			this.unloadDevMode(this.devMode);
		}
	}

	loadDevMode(): DevModeType {
		new Notice("Dev mode is enabled.");
		return {
			ribbonIcon: this.addRibbonIcon(
				"chevron-right-square",
				"Generate Syncthing conflicts",
				this.openDevModeModal
			),
			command: this.addCommand({
				id: "generate-syncthing-conflicts",
				name: "Generate Syncthing conflicts",
				icon: "chevron-right-square",
				callback: this.openDevModeModal
			})
		}
	}

	unloadDevMode(devMode: DevModeType) {
		new Notice("Dev mode disabled.");
		devMode.ribbonIcon.remove();
		this.removeCommand(devMode.command.id);
	}

	private openDevModeModal() {
		new DevModeModal(
			this.app,
			new PluginDevModeController(this)
		).open();
	}
}
