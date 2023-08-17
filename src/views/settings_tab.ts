import {
	App,
	Notice,
	PluginSettingTab,
	Setting
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
