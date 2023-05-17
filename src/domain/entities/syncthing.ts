/**
 * SyncThing configuration object.
 *
 * This is a minimalist version of the actual configuration object retrieved from the API.
 * It should be reflecting the json response from the `/rest/config/` endpoint.
 * @see https://docs.syncthing.net/users/config.html#config-file-format
 */
export class SyncThingConfiguration {
	constructor(
		public folders: SyncThingFolder[],
		public devices: SyncThingDevice[]
	) {}
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
	constructor(
		public id: string,
		public label: string,
		public path: string,
		public filesystemType: string,
		public type: SyncTypes,
		public devices: ReducedSyncThingDevice[],
		public maxConflicts: number
	) {}
}

/**
 * SyncThing device object.
 *
 * This is a minimalist version of the actual device object retrieved from the API.
 * @see https://docs.syncthing.net/users/config.html#device-element
 */
export class SyncThingDevice {
	constructor(
		public deviceID: string,
		public introducedBy: string,
		public encryptionPassword: string,
		public address: string[],
		public paused: boolean,
		public ignoredFolders: string[],
		public name?: string
	) {}
}

/**
 * This is the devices' information that is stored in the folder object.
 * {@link SyncThingFolder}
 */
export class ReducedSyncThingDevice
	implements
		Pick<
			SyncThingDevice,
			"deviceID" | "introducedBy" | "encryptionPassword"
		>
{
	constructor(
		public deviceID: string,
		public introducedBy: string,
		public encryptionPassword: string
	) {}
}
