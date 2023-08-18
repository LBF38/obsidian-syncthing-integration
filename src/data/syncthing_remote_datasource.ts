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
 * REST API of Syncthing.
 * @see https://docs.syncthing.net/dev/rest.html
 */
export class SyncthingFromREST {
	constructor(public plugin: SyncthingPlugin) {}

	/**
	 * Ping the Syncthing installation using the REST API.
	 * This is used to check if Syncthing is installed.
	 */
	async ping(): Promise<"pong"> {
		const response = await this.requestEndpoint(
			this.plugin.settings.configuration.syncthingBaseUrl +
				"/rest/system/ping"
		);
		console.log("REST - ping: ", response);
		return response.json["ping"];
	}

	/**
	 * Get all the folders of Syncthing installation using the REST API.
	 */
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

	/**
	 * Get all the folders of Syncthing installation for a specific device using the REST API.
	 * @param device - The device to get the folders for.
	 */
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

	/**
	 * Get all the devices of Syncthing installation using the REST API.
	 */
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

	/**
	 * Get the configuration of Syncthing installation using the REST API.
	 * @returns {SyncThingConfiguration} The configuration of Syncthing installation.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	async getConfiguration(): Promise<SyncThingConfigurationModel> {
		const response = await this.requestEndpoint(
			`${this.plugin.settings.configuration.syncthingBaseUrl}/rest/system/config`
		);
		return SyncThingConfigurationModel.fromJSON(await response.json());
	}

	private async requestEndpoint(endpoint: string) {
		const request = requestUrl({
			url: `http://${endpoint}`,
			method: "GET",
			headers: {
				"X-API-Key": this.plugin.settings.api_key,
				Accept: "*/*",
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
		// console.log("requestEndpoint: ", this.plugin.settings.api_key);
		return request
			.then((response) => {
				console.log("requestEndpoint response: ", response);
				if (response.status >= 400) {
					throw new RestFailure(response.text);
				}
				return response;
			})
			.catch((error) => {
				console.error("requestEndpoint error: ", error);
				throw new RestFailure(error);
			});
	}
}
