/**
 * SyncThing configuration object.
 *
 * This is a minimalist version of the actual configuration object retrieved from the API.
 * It should be reflecting the json response from the `/rest/config/` endpoint.
 * @see https://docs.syncthing.net/users/config.html#config-file-format
 */
export class SyncThingConfiguration {
	folders: SyncThingFolder[];
	devices: SyncThingDevice[];

	constructor(folders: SyncThingFolder[], devices: SyncThingDevice[]) {
		this.folders = folders;
		this.devices = devices;
	}
}

/**
 * SyncThing folder object.
 *
 * This is a minimalist version of the actual folder object retrieved from the API.
 * @see https://docs.syncthing.net/users/config.html#folder-element
 */
export class SyncThingFolder {
	id: string;
	path: string;
	label: string;
	filesystemType: string;
	type: string;
	devices: SyncThingDevice[];

	constructor(
		id: string,
		path: string,
		label: string,
		filesystemType: string,
		type: string,
		devices: SyncThingDevice[]
	) {
		this.id = id;
		this.path = path;
		this.label = label;
		this.filesystemType = filesystemType;
		this.type = type;
		this.devices = devices;
	}
}

/**
 * SyncThing device object.
 *
 * This is a minimalist version of the actual device object retrieved from the API.
 * @see https://docs.syncthing.net/users/config.html#device-element
 */
export class SyncThingDevice {
	deviceID: string;
	name: string;
	introducedBy: string;
	encryptionPassword: string;

	constructor(
		deviceID: string,
		name: string,
		introducedBy: string,
		encryptionPassword: string
	) {
		this.deviceID = deviceID;
		this.name = name;
		this.introducedBy = introducedBy;
		this.encryptionPassword = encryptionPassword;
	}
}
