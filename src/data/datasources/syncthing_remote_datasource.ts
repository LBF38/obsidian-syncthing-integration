import { SyncThingConfigurationModel } from "../models/syncthing";

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
	getConfiguration(): Promise<SyncThingConfigurationModel> {
		throw new Error("Method not implemented.");
	}
}

// class SyncThingAPI {
// 	private _url: string;
// 	private _headers: Record<string, string>;
// 	syncthingConfiguration: SyncThingConfiguration =
// 		Object.prototype as SyncThingConfiguration;

// 	constructor(url: string, apiKey: string) {
// 		this._url = url;
// 		this._headers = {
// 			"X-API-Key": apiKey,
// 		};
// 	}

// 	async getConfiguration(): Promise<SyncThingConfiguration> {
// 		const response = await fetch(`${this._url}/rest/system/config`, {
// 			headers: this._headers,
// 		}).then((response) => {
// 			if (!response.ok) {
// 				throw new Error(response.statusText);
// 			}
// 			return response;
// 		});
// 		const responseFolders = (await response.json())["folders"];
// 		const folders: SyncThingFolder[] = [];
// 		const devices: SyncThingDevice[] = [];
// 		for (const folder of responseFolders) {
// 			for (const device of folder.devices) {
// 				devices.push({
// 					deviceID: device.deviceID,
// 					introducedBy: device.introducedBy,
// 					encryptionPassword: device.encryptionPassword,
// 					label: device.name,
// 				});
// 			}
// 			folders.push({
// 				id: folder.id,
// 				path: folder.path,
// 				label: folder.label,
// 				filesystemType: folder.filesystemType,
// 				type: folder.type,
// 				devices: devices,
// 			});
// 		}
// 		this.syncthingConfiguration = {
// 			folders: folders,
// 			devices: devices,
// 		};
// 		return this.syncthingConfiguration;
// 	}
// }

// export { SyncThingAPI };
