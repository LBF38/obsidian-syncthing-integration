import { exec } from "child_process";
import { Editor, Modal, Notice, Plugin } from "obsidian";
import { SyncThingFromRESTimpl } from "./data/datasources/syncthing_remote_datasource";
import { SampleSettingTab } from "./presentation/pages/syncthing_settings_page";
import { SyncThingConfiguration } from "./domain/entities/syncthing";

//! Remember to rename these classes and interfaces!

interface MyPluginSettings {
	api_key: string | null;
	configuration: SyncThingConfiguration | null;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	api_key: null,
	configuration: null,
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("cloud", "SyncThing status", (evt: MouseEvent) => {
			if (!this.settings.api_key) {
				new Notice("Please set the API key in the settings first.");
				return;
			}
			const syncthingAPI = new SyncThingFromRESTimpl();
			syncthingAPI.getConfiguration().then((config) => {
				console.log(config);
				const modal = new Modal(this.app);
				modal.titleEl.setText("SyncThing configuration");
				for (const folder of config.folders) {
					modal.contentEl.createEl("p", {
						text: folder.label,
					});
				}
				modal.open();
			});
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("SyncThing status");
		statusBarItemEl.onClickEvent(() => {
			new Notice("SyncThing integration is not yet implemented.");
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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// Exemple de commande Syncthing
		const syncthingCommand =
			"syncthing --version && syncthing cli show system && syncthing cli config gui apikey get && syncthing cli config dump-json";

		// Exemple d'appel à la commande dans le plugin Obsidian
		this.addCommand({
			id: "run-syncthing-command",
			name: "Run Syncthing Command",
			callback: () => {
				this.runSyncthingCommand(syncthingCommand);
			},
		});
	}

	runSyncthingCommand(command: string) {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(
					`Erreur lors de l'exécution de la commande : ${error.message}`
				);
				return;
			}

			if (stderr) {
				console.error(
					`Erreur dans la sortie de la commande : ${stderr}`
				);
				return;
			}

			console.log(`Résultat de la commande : ${stdout}`);
		});
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
