import { requestUrl } from "obsidian";
import { SyncThingConfigurationModel } from "../models/syncthing";
import { SyncThingFromCLIimpl } from "./syncthing_local_datasource";

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
	private apikey: string;
	constructor() {
		const syncthingFromCLI = new SyncThingFromCLIimpl();
		const apikey = syncthingFromCLI.getAPIkey();
		if (apikey instanceof Error) {
			throw apikey;
		}
		this.apikey = apikey;
	}
	async getConfiguration(): Promise<SyncThingConfigurationModel> {
		const baseURL = "http://localhost:8384";
		const response = await requestUrl({
			url: `${baseURL}/rest/system/config`,
			method: "GET",
			headers: {
				"X-API-Key": this.apikey,
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
