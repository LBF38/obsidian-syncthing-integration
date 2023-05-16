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

type SyncTypes =
	| "sendreceive"
	| "sendonly"
	| "receiveonly"
	| "receiveencrypted";

/**
 * SyncThing folder object.
 *
 * This is a minimalist version of the actual folder object retrieved from the API.
 * @see https://docs.syncthing.net/users/config.html#folder-element
 */
export class SyncThingFolder {
	id: string; // unique
	label: string;
	path: string;
	filesystemType: string;
	type: SyncTypes;
	devices: SyncThingDevice[];
	maxConflicts: number;

	constructor(
		id: string,
		label: string,
		path: string,
		filesystemType: string,
		type: SyncTypes,
		devices: SyncThingDevice[],
		maxConflicts: number
	) {
		this.id = id;
		this.label = label;
		this.path = path;
		this.filesystemType = filesystemType;
		this.type = type;
		this.devices = devices;
		this.maxConflicts = maxConflicts;
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
	name?: string;
	introducedBy: string;
	encryptionPassword: string;
	address: string[]; // TODO: if necessary, change to a more specific type
	paused: boolean;
	ignoredFolders: string[]; // Should contain folder IDs

	constructor(
		deviceID: string,
		introducedBy: string,
		encryptionPassword: string,
		address: string[],
		paused: boolean,
		ignoredFolders: string[],
		name?: string
	) {
		this.deviceID = deviceID;
		this.name = name;
		this.introducedBy = introducedBy;
		this.encryptionPassword = encryptionPassword;
		this.address = address;
		this.paused = paused;
		this.ignoredFolders = ignoredFolders;
	}
}
