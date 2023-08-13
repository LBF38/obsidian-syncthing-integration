import {
	App,
	Notice,
	Platform,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";
import { type SyncthingController } from "src/controllers/main_controller";
import SyncthingPlugin from "src/main";
import { SyncThingConfiguration, SyncThingDevice } from "src/models/entities";
import { Failure } from "src/models/failures";
import { ObsidianLogo, SyncthingLogo } from "./logos";

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

		// // Banner
		// this.createPluginBanner(containerEl);
		// this.pluginInformation(containerEl);

		// // Check if Syncthing is installed.
		// const hasSyncthing = await this.syncthingController.hasSyncThing();
		// if (!hasSyncthing) {
		// 	new Setting(containerEl)
		// 		.setName("Syncthing is not installed.")
		// 		.setDesc("Please install Syncthing at the following URL.")
		// 		.addButton((button) => {
		// 			button
		// 				.setIcon("link")
		// 				.setCta()
		// 				.onClick(() => {
		// 					open("https://syncthing.net/downloads", "_blank");
		// 				});
		// 		});
		// 	return;
		// }

		// // For mobile app
		// this.openMobileApp(containerEl);
		// if (Platform.isMobileApp) {
		// 	const warningSetting = new Setting(containerEl)
		// 		.setName("Warning")
		// 		.setHeading()
		// 		.setDesc(
		// 			"The following settings are in beta. All plugin's features may not currently be available on mobile."
		// 		);
		// 	warningSetting.nameEl.style.color = "rgba(255, 0, 0, 0.8)";
		// 	warningSetting.descEl.style.color = "rgba(255, 0, 0, 0.8)";
		// }

		// API Key setting.
		await this.apiKeySetting(containerEl);

		// Get the Syncthing configuration from CLI or API.
		this.configurationSetting(containerEl);

		// To check the API status.
		new Setting(containerEl)
			.setName("Syncthing API Status")
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
		if (Platform.isDesktopApp) {
			new Setting(containerEl)
				.setName("Syncthing CLI Status")
				.addButton((button) => {
					button
						.setButtonText("Check CLI Status")
						.onClick(async () => {
							this.syncthingController
								.getCLIStatus()
								.then((status) => {
									new Notice(
										`Syncthing CLI Status : ${status}`
									);
								});
						});
				});
		}

		// Open Syncthing GUI.
		this.syncthingGUIsettings(containerEl);

		// Syncthing configuration integration. This part should show the configuration of the Syncthing instance for the vault.
		this.syncthingConfiguration(containerEl);

		// Plugin's dev Mode.
		this.pluginDevModeSetting(containerEl);
	}

	private syncthingConfiguration(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName("Syncthing Configuration")
			.setHeading()
			.setDesc(
				"This section will show the configuration of the Syncthing instance for the vault."
			);

		new Setting(containerEl).setName("This part is not implemented yet.");

		// containerEl.createEl("h2", { text: "This Device" });
		// containerEl.createEl("p", {
		// 	text: "This table will show the folders and devices that are configured on the Syncthing instance.",
		// });
		// this.initConfigTable(containerEl, configuration);
		// containerEl.createEl("h2", { text: "Other Devices" });
		// containerEl.createEl("p", {
		// 	text: "This table will show the folders and devices that are configured on the Syncthing instance.",
		// });

		// // Folder infos.
		// containerEl.createEl("h2", { text: "Folder Infos" });
		// containerEl.createEl("p", {
		// 	text: "This table will show the information concerning the syncthing shared folder, which corresponds to the current vault.",
		// });
	}

	private pluginDevModeSetting(containerEl: HTMLElement) {
		new Setting(containerEl).setName("Developer Mode").setHeading();
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

	private syncthingGUIsettings(containerEl: HTMLElement) {
		new Setting(containerEl).setName("Syncthing GUI").setHeading();
		new Setting(containerEl)
			.setName("Set GUI address")
			.setDesc(
				"Please set your Syncthing GUI address here. This address will be used to open the Syncthing GUI in your browser."
			)
			.addText((text) => {
				text.setPlaceholder("Enter your GUI address here...")
					.setValue(
						this.plugin.settings.configuration.syncthingBaseUrl ??
							""
					)
					.onChange(async (value) => {
						this.plugin.settings.configuration.syncthingBaseUrl =
							value;
						await this.plugin.saveSettings();
					});
			});

		if (Platform.isMobileApp) {
			const guiSetting = new Setting(containerEl)
				.setName("Set GUI Credentials")
				.setDesc(
					"Please set your Syncthing GUI credentials here. These credentials will be used to open the Syncthing GUI in your browser."
				);
			guiSetting
				.addText((text) => {
					text.setPlaceholder("Enter your GUI username here...")
						.setValue(this.plugin.settings.gui_username ?? "")
						.onChange(async (value) => {
							this.plugin.settings.gui_username = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.setAttribute("id", "gui-username");
				})
				.addText((text) => {
					text
						.setPlaceholder("Enter your GUI password here...")
						.setValue(this.plugin.settings.gui_password ?? "")
						.onChange(async (value) => {
							this.plugin.settings.gui_password = value;
							await this.plugin.saveSettings();
						}).inputEl.type = "password";
					text.inputEl.setAttribute("id", "gui-password");
				})
				.addButton((button) => {
					button.setIcon("eye").onClick(async () => {
						guiSetting.components.forEach((component) => {
							if (
								component instanceof TextComponent &&
								component.inputEl.id === "gui-password"
							) {
								component.inputEl.type =
									component.inputEl.type === "password"
										? "text"
										: "password";
								button.setIcon(
									component.inputEl.type === "password"
										? "eye"
										: "eye-off"
								);
							}
						});
					});
				});
		}

		new Setting(containerEl)
			.setName("Open Syncthing GUI")
			.setDesc("Open the Syncthing GUI in your browser.")
			.addButton((button) => {
				button
					.setIcon("link")
					.setCta()
					.onClick(async () => {
						if (
							(!this.plugin.settings.gui_username ||
								!this.plugin.settings.gui_password) &&
							Platform.isMobileApp
						) {
							new Notice(
								"Please set your GUI credentials first. There are needed on mobile app."
							);
							return;
						}
						const url = `http://${
							this.plugin.settings.gui_username
						}:${this.plugin.settings.gui_password}@${
							this.plugin.settings.configuration
								.syncthingBaseUrl ?? "localhost:8384"
						}`;
						window.open(url);
					});
			});
	}

	private pluginInformation(containerEl: HTMLElement) {
		const headerSetting = new Setting(containerEl)
			.setName("Syncthing Integration for Obsidian")
			.setHeading();
		headerSetting.descEl
			.createEl("p", {
				text: "This plugin allows you to sync your vault with Syncthing.\nIt allows you to manage the sync process from within Obsidian.\nYou can only manage the folder you are in.\n\nTo use this plugin, you need to have Syncthing installed on your computer.\n\nYou can find more information about Syncthing here: ",
			})
			.appendChild(
				containerEl.createEl("a", {
					text: "https://syncthing.net/",
					href: "https://syncthing.net/",
				})
			);
	}

	private createPluginBanner(containerEl: HTMLElement) {
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
		syncthingImg.style.height = "50px";
		obsidianImg.style.height = "50px";
		banner.style.justifyContent = "center";
		banner.style.display = "flex";
		link.append(syncthingImg, obsidianImg);
		banner.append(link);
	}

	private async configurationSetting(containerEl: HTMLElement) {
		const configSetting = new Setting(containerEl)
			.setName("Get Syncthing Configuration")
			.setDesc(
				"This button will get the configuration of the Syncthing instance for the vault."
			);
		configSetting.addButton((button) => {
			button
				.setIcon("sync")
				.setCta()
				.onClick(async () => {
					const configuration =
						await this.syncthingController.getConfiguration();
					if (configuration instanceof Failure) {
						configSetting
							.setName("Error")
							.setDesc(
								"Error getting configuration. Please try again later."
							);
						new Notice(
							"Error getting configuration. Please try again later."
						);
						return;
					}
					this.plugin.settings.configuration = configuration;
				});
		});
	}

	private async apiKeySetting(containerEl: HTMLElement) {
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
			.setName("Syncthing API Key")
			.setDesc("Add your Syncthing API key here for the plugin to work.")
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
			return;
		}
		apiKeySetting.addButton((button) => {
			button.setButtonText("Clear API Key input").onClick(async () => {
				this.plugin.settings.api_key = "";
				this.plugin.saveSettings();
				this.display();
			});
		});
		apiKeySetting.addButton((button) => {
			button.setIcon("eye").onClick(async () => {
				apiKeySetting.components.forEach((component) => {
					if (component instanceof TextComponent) {
						component.inputEl.type =
							component.inputEl.type === "password"
								? "text"
								: "password";
						button.setIcon(
							component.inputEl.type === "password"
								? "eye"
								: "eye-off"
						);
					}
				});
			});
		});
	}

	private openMobileApp(containerEl: HTMLElement) {
		if (!Platform.isMobileApp) {
			return;
		}
		new Setting(containerEl)
			.setName("Open Syncthing mobile app on Google Play Store.")
			.setDesc("Open the Syncthing mobile app page on Google Play Store.")
			.addButton((button) => {
				button
					.setIcon("play")
					.setCta()
					.onClick(async () => {
						if (!Platform.isAndroidApp) {
							new Notice(
								"The feature is not implemented for your platform. Please open the Syncthing app for your platform. You can create an issue on GitHub if you want to request this feature.",
								5000
							);
							return;
						}
						this.plugin.syncthingFromAndroid.openSyncthing();
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
