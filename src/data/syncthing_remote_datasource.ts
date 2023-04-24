interface SyncThingConfiguration {
	folders: SyncThingFolder[];
}

interface SyncThingFolder {
	id: string;
	path: string;
	label: string;
	filesystemType: string;
	type: string;
	devices: SyncThingDevice[];
	rescanIntervalS: number;
	fsWatcherEnabled: boolean;
	fsWatcherDelayS: number;
	ignorePerms: boolean;
	autoNormalize: boolean;
	minDiskFree: {
		value: number;
		unit: string;
	};
	versioning: {
		type: string;
		params: unknown;
		cleanupIntervalS: number;
		fsPath: string;
		fsType: string;
	};
	copiers: number;
}

interface SyncThingDevice {
	deviceID: string;
	introducedBy: string;
	encryptionPassword: string;
}

class SyncThingAPI {
	private _url: string;
	private _apiKey: string;
	private _headers: Record<string, string>;
	syncthingConfiguration: SyncThingConfiguration= Object.prototype as SyncThingConfiguration;

	constructor(url: string, apiKey: string) {
		this._url = url;
		this._apiKey = apiKey;
		this._headers = {
			"X-API-Key": apiKey,
		};
	}

	async getConfiguration(): Promise<SyncThingConfiguration> {
		const response = await fetch(`${this._url}/rest/system/config`, {
			headers: this._headers,
		}).then((response) => {
			if (!response.ok) {
				throw new Error(response.statusText);
			}
			return response;
		});
		const responseFolders = (await response.json())["folders"];
		const folders: SyncThingFolder[] = [];
		for (const folder of responseFolders) {
			const devices: SyncThingDevice[] = [];
			for (const device of folder.devices) {
				devices.push({
					deviceID: device.deviceID,
					introducedBy: device.introducedBy,
					encryptionPassword: device.encryptionPassword,
				});
			}
			folders.push({
				id: folder.id,
				path: folder.path,
				label: folder.label,
				filesystemType: folder.filesystemType,
				type: folder.type,
				devices: devices,
				rescanIntervalS: folder.rescanIntervalS,
				fsWatcherEnabled: folder.fsWatcherEnabled,
				fsWatcherDelayS: folder.fsWatcherDelayS,
				ignorePerms: folder.ignorePerms,
				autoNormalize: folder.autoNormalize,
				minDiskFree: {
					value: folder.minDiskFree.value,
					unit: folder.minDiskFree.unit,
				},
				versioning: {
					type: folder.versioning.type,
					params: folder.versioning.params,
					cleanupIntervalS: folder.versioning.cleanupIntervalS,
					fsPath: folder.versioning.fsPath,
					fsType: folder.versioning.fsType,
				},
				copiers: folder.copiers,
			});
		}
		this.syncthingConfiguration = {
			folders: folders,
		};
		return this.syncthingConfiguration;
	}
}

export { SyncThingAPI };
