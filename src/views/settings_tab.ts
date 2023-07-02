import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { SyncthingController } from "src/controllers/main_controller";
import SyncthingPlugin from "src/main";
import { Failure } from "src/models/failures";
import { ObsidianLogo, SyncthingLogo } from "./logos";
import { SyncThingConfiguration, SyncThingDevice } from "src/models/entities";

export class SyncthingSettingTab extends PluginSettingTab {
	plugin: SyncthingPlugin;
	syncthingController: SyncthingController;

	constructor(app: App, plugin: SyncthingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.syncthingController = plugin.syncthingController;
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();

		// Banner
		const banner = containerEl.createEl("p");
		const link = banner.createEl("a", {
			attr: {
				href: "https://github.com/lbf38/obsidian-syncthing-integration",
			},
		});
		const syncthingImg = containerEl.createEl("img", {
			attr: {
				src: SyncthingLogo,
			},
		});
		const obsidianImg = containerEl.createEl("img", {
			attr: {
				src: ObsidianLogo,
			},
		});
		syncthingImg.style.height = "100px";
		obsidianImg.style.height = "100px";
		banner.style.alignContent = "center";
		link.append(syncthingImg, obsidianImg);
		banner.append(link);

		// Check if Syncthing is installed.
		const hasSyncthing = await this.syncthingController.hasSyncThing();
		if (!hasSyncthing) {
			containerEl.createEl("h1", { text: "Syncthing is not installed." });
			containerEl
				.createEl("p", {
					text: "Please install Syncthing at the following URL: ",
				})
				.append(
					containerEl.createEl("a", {
						text: "https://syncthing.net/downloads",
						href: "https://syncthing.net/downloads",
					})
				);
			return;
		}

		// Get the Syncthing configuration from CLI or API.
		const configuration = await this.syncthingController.getConfiguration();
		if (configuration instanceof Failure) {
			containerEl.createEl("h2", {
				text: "Error getting configuration. Please try again later.",
			});
			return;
		}
		this.plugin.settings.configuration = configuration;

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

		// API Key setting.
		const apiKeySetting = new Setting(containerEl);
		// Try to get the API key from the CLI.
		await this.syncthingController.getAPIKey().then((key) => {
			if (key instanceof Failure) {
				return;
			}
			this.plugin.settings.api_key = key;
			this.plugin.saveSettings();
		});

		// Display the API key setting.
		apiKeySetting
			.setName("SyncThing API Key")
			.setDesc("Add your SyncThing API key here for the plugin to work.")
			.addText(
				(text) =>
					(text
						.setPlaceholder("Enter your API key here...")
						.setValue(this.plugin.settings.api_key ?? "")
						.onChange(async (value) => {
							this.plugin.settings.api_key = value;
							await this.plugin.saveSettings();
						}).inputEl.type = "password")
			);
		// Show a button relative to the API key setting.
		// If the API key is not set, show a button to get it.
		// If the API key is set, show a button to remove it.
		if (!this.plugin.settings.api_key) {
			apiKeySetting.addButton((button) => {
				button.setButtonText("Get API Key").onClick(async () => {
					this.syncthingController.getAPIKey().then((key) => {
						if (key instanceof Failure) {
							new Notice(key.message);
							return;
						}
						this.plugin.settings.api_key = key;
						this.plugin.saveSettings();
						this.display();
					});
				});
			});
		} else {
			apiKeySetting.addButton((button) => {
				button.setButtonText("Remove API Key").onClick(async () => {
					this.plugin.settings.api_key = "";
					this.plugin.saveSettings();
					this.display();
				});
			});
		}

		// To check the API status.
		new Setting(containerEl)
			.setName("SyncThing API Status")
			.addButton((button) => {
				button.setButtonText("Check API Status").onClick(async () => {
					this.syncthingController
						.getAPIStatus()
						.then((status) => {
							new Notice(`Syncthing Ping : ${status}`);
						})
						.catch((error) => {
							new Notice(error);
						});
				});
			});

		// To check the Syncthing CLI status.
		new Setting(containerEl)
			.setName("SyncThing CLI Status")
			.addButton((button) => {
				button.setButtonText("Check CLI Status").onClick(async () => {
					this.syncthingController.getCLIStatus().then((status) => {
						new Notice(`Syncthing CLI Status : ${status}`);
					});
				});
			});

		// TEST : difference between file.basename and file.name in Obsidian API.
		// const file = this.app.vault.getFiles()[0];
		// containerEl.createEl("h1", { text: "TEST" });
		// containerEl.createEl("p", { text: "file.basename: " + file.basename });
		// containerEl.createEl("p", { text: "file.name: " + file.name });
		// ! file.basename : file name without extension
		// ! file.name : file name with extension

		containerEl.createEl("h1", { text: "Syncthing Configuration" });
		containerEl.createEl("h2", { text: "This Device" });
		containerEl.createEl("p", {
			text: "This table will show the folders and devices that are configured on the Syncthing instance.",
		});
		this.initConfigTable(containerEl, configuration);
		containerEl.createEl("h2", { text: "Other Devices" });
		containerEl.createEl("p", {
			text: "This table will show the folders and devices that are configured on the Syncthing instance.",
		});

		// Folder infos.
		containerEl.createEl("h2", { text: "Folder Infos" });
		containerEl.createEl("p", {
			text: "This table will show the information concerning the syncthing shared folder, which corresponds to the current vault.",
		});

		// Open Syncthing GUI.
		new Setting(containerEl)
			.setName("Open Syncthing GUI")
			.setHeading()
			.setDesc("Open the Syncthing GUI in your browser.")
			.addButton((button) => {
				button
					.setIcon("link")
					.setCta()
					.onClick(async () => {
						window.location.href =
							this.plugin.settings.configuration
								.syncthingBaseUrl ?? "http://localhost:8384";
					});
			});

		// Plugin's dev Mode.
		containerEl.createEl("h1", { text: "Developer Mode" });
		new Setting(containerEl)
			.setName("Enable Plugin's Developer Mode")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.devMode)
					.onChange(async (value) => {
						this.plugin.settings.devMode = value;
						await this.plugin.saveSettings();
						this.plugin.onunload();
						this.plugin.onload();
					});
			});
	}

	/**
	 * Initiate a config table containing the folders and devices configured on the Syncthing instance.
	 */
	private async initConfigTable(
		containerEl: HTMLElement,
		configuration: SyncThingConfiguration
	): Promise<HTMLTableElement> {
		const configTable = containerEl.createEl("table");
		configTable.appendChild(containerEl.createEl("tbody"));
		//create headers
		const headerRow = configTable.createEl("thead").createEl("tr");
		headerRow.createEl("th", { text: "Device ID" });
		headerRow.createEl("th", { text: "Device Name" });
		headerRow.createEl("th", { text: "Device Address" });
		//create rows
		configuration.devices.forEach((device) => {
			this.addConfigRowToTable(configTable, device);
		});
		return configTable;
	}

	/**
	 * This helper method should help to make new rows from the syncthing configuration given in params.
	 * @param tableEl - The table element to add the row to.
	 */
	private addConfigRowToTable(
		tableEl: HTMLTableElement,
		deviceInfo: SyncThingDevice
	) {
		const rowEl = tableEl.appendChild(tableEl.createEl("tr"));
		rowEl.appendChild(
			tableEl.createEl("td", { text: deviceInfo.deviceID.slice(0, 8) })
		);
		rowEl.appendChild(tableEl.createEl("td", { text: deviceInfo.name }));
		rowEl.appendChild(
			tableEl.createEl("td", { text: deviceInfo.address.join(", ") })
		);
	}
}
