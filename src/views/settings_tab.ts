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
import SettingView from "../components/settings_view.svelte";

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

		new SettingView({
			target: containerEl,
			props: {
				parent: this
			}
		})
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
						const url = `http://${this.plugin.settings.gui_username
							}:${this.plugin.settings.gui_password}@${this.plugin.settings.configuration
								.syncthingBaseUrl ?? "localhost:8384"
							}`;
						window.open(url);
					});
			});
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
