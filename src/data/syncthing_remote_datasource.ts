import { requestUrl } from "obsidian";
import SyncthingPlugin from "src/main";
import { SyncThingDevice } from "src/models/entities";
import { RestFailure } from "src/models/failures";
import {
	SyncThingConfigurationModel,
	SyncThingDeviceModel,
	SyncThingFolderModel,
} from "../models/models";

/**
 * Interface for the REST API of Syncthing.
 * @see https://docs.syncthing.net/dev/rest.html
 */
export interface SyncThingFromREST {
	/**
	 * Get the configuration of Syncthing installation using the REST API.
	 * @returns {SyncThingConfiguration} The configuration of Syncthing installation.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	getConfiguration(): Promise<SyncThingConfigurationModel>;
	/**
	 * Get all the folders of Syncthing installation using the REST API.
	 */
	getAllFolders(): Promise<SyncThingFolderModel[]>;
	/**
	 * Get all the folders of Syncthing installation for a specific device using the REST API.
	 * @param device - The device to get the folders for.
	 */
	getFoldersForDevice(
		device: SyncThingDevice
	): Promise<SyncThingFolderModel[]>;
	/**
	 * Get all the devices of Syncthing installation using the REST API.
	 */
	getDevices(): Promise<SyncThingDeviceModel[]>;
	/**
	 * Ping the Syncthing installation using the REST API.
	 * This is used to check if Syncthing is installed.
	 */
	ping(): Promise<"pong">;
}

export class SyncThingFromRESTimpl implements SyncThingFromREST {
	constructor(public plugin: SyncthingPlugin) {}
	async ping(): Promise<"pong"> {
		const response = await this.requestEndpoint(
			this.plugin.settings.configuration.syncthingBaseUrl +
				"/rest/system/ping"
		);
		console.log(response);
		return response.json["ping"];
	}
	async getAllFolders(): Promise<SyncThingFolderModel[]> {
		const response = await this.requestEndpoint(
			`${this.plugin.settings.configuration.syncthingBaseUrl}/rest/system/config/folders`
		);
		const foldersModel: SyncThingFolderModel[] = [];
		for (const folder of await response.json()) {
			console.log("REST: ", folder);
			foldersModel.push(SyncThingFolderModel.fromJSON(folder));
		}
		return foldersModel;
	}

	async getFoldersForDevice(
		device: SyncThingDevice
	): Promise<SyncThingFolderModel[]> {
		const folders = await this.getAllFolders();
		return folders.filter((folder) =>
			folder.devices.some(
				(deviceInFolder) => deviceInFolder.deviceID === device.deviceID
			)
		);
	}
	async getDevices(): Promise<SyncThingDeviceModel[]> {
		const response = await this.requestEndpoint(
			`${this.plugin.settings.configuration.syncthingBaseUrl}/rest/system/config/devices`
		);
		const devicesModel: SyncThingDeviceModel[] = [];
		for (const device of await response.json()) {
			devicesModel.push(SyncThingDeviceModel.fromJSON(device));
		}
		return devicesModel;
	}

	async getConfiguration(): Promise<SyncThingConfigurationModel> {
		const response = await this.requestEndpoint(
			`${this.plugin.settings.configuration.syncthingBaseUrl}/rest/system/config`
		);
		return SyncThingConfigurationModel.fromJSON(await response.json());
	}

	private async requestEndpoint(endpoint: string) {
		return await requestUrl({
			url: endpoint,
			method: "GET",
			headers: {
				"X-API-Key": this.plugin.settings.api_key,
				Accept: "*/*",
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		}).then((response) => {
			if (response.status >= 400) {
				throw new RestFailure(response.text);
			}
			return response;
		});
	}
}
