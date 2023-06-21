import { requestUrl } from "obsidian";
import SyncthingPlugin from "src/main";
import { SyncThingConfigurationModel } from "../models/models";

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
}

export class SyncThingFromRESTimpl implements SyncThingFromREST {
	constructor(public plugin: SyncthingPlugin) {}

	async getConfiguration(): Promise<SyncThingConfigurationModel> {
		const baseURL = "http://localhost:8384";
		const response = await requestUrl({
			url: `${baseURL}/rest/system/config`,
			method: "GET",
			headers: {
				"X-API-Key": this.plugin.settings.api_key,
				Accept: "*/*",
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		}).then((response) => {
			if (response.status >= 400) {
				throw new Error(response.text);
			}
			return response;
		});
		return SyncThingConfigurationModel.fromJSON(await response.json());
	}
}
