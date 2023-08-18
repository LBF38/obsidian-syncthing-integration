import { requestUrl } from "obsidian";
import SyncthingPlugin from "src/main";
import { SyncthingDevice } from "src/models/entities";
import { RestFailure } from "src/models/failures";
import {
	SyncthingConfigurationModel,
	SyncthingDeviceModel,
	SyncthingFolderModel,
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
		const response = await this.requestEndpoint("/rest/system/ping");
		console.log("REST - ping: ", response);
		return response.json["ping"];
	}

	/**
	 * Get all the folders of Syncthing installation using the REST API.
	 */
	async getAllFolders(): Promise<SyncthingFolderModel[]> {
		const response = await this.requestEndpoint(
			"/rest/system/config/folders"
		);
		const foldersModel: SyncthingFolderModel[] = [];
		for (const folder of await response.json()) {
			console.log("REST: ", folder);
			foldersModel.push(SyncthingFolderModel.fromJSON(folder));
		}
		return foldersModel;
	}

	/**
	 * Get all the folders of Syncthing installation for a specific device using the REST API.
	 * @param device - The device to get the folders for.
	 */
	async getFoldersForDevice(
		device: SyncthingDevice
	): Promise<SyncthingFolderModel[]> {
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
	async getDevices(): Promise<SyncthingDeviceModel[]> {
		const response = await this.requestEndpoint(
			"/rest/system/config/devices"
		);
		const devicesModel: SyncthingDeviceModel[] = [];
		for (const device of await response.json()) {
			devicesModel.push(SyncthingDeviceModel.fromJSON(device));
		}
		return devicesModel;
	}

	/**
	 * Get the configuration of Syncthing installation using the REST API.
	 * @returns {SyncthingConfiguration} The configuration of Syncthing installation.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	async getConfiguration(): Promise<SyncthingConfigurationModel> {
		const response = await this.requestEndpoint("/rest/system/config");
		return SyncthingConfigurationModel.fromJSON(await response.json());
	}

	/**
	 * Private method to request an endpoint of the REST API.
	 * The endpoint should start with a `/`.
	 *
	 * @param endpoint - The REST endpoint to call. @see https://docs.syncthing.net/dev/rest.html
	 * @returns The response of the REST API.
	 */
	private async requestEndpoint(endpoint: string) {
		// FIXME: Fix the issue when connecting to the REST API. (error 403)
		console.log("requestEndpoint: Endpoint", endpoint);
		const url = `${this.plugin.settings.configuration.url?.protocol}://${this.plugin.settings.configuration.url?.ip_address}:${this.plugin.settings.configuration.url?.port}${endpoint}`;
		const response = requestUrl({
			url: url,
			method: "GET",
			headers: {
				"X-API-Key": this.plugin.settings.api_key,
				Accept: "*/*",
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
		console.log(
			"requestEndpoint: API Key set ?",
			this.plugin.settings.api_key !== ""
		);
		console.log("requestEndpoint: url requested ", url);
		return response
			.then((response) => {
				console.log("requestEndpoint: response ", response);
				if (response.status >= 400) {
					throw new RestFailure(response.text);
				}
				return response;
			})
			.catch((error) => {
				console.error("requestEndpoint: error: ", error);
				throw new RestFailure(error);
			});
	}
}
