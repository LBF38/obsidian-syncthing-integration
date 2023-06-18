/**
 * SyncThing configuration object.
 *
 * This is a minimalist version of the actual configuration object retrieved from the API.
 * It should be reflecting the json response from the `/rest/config/` endpoint.
 * @see https://docs.syncthing.net/users/config.html#config-file-format
 */
export class SyncThingConfiguration {
	constructor(
		/**
		 * The configuration's version
		 * @see https://docs.syncthing.net/users/config.html#config-option-configuration.version
		 */
		public version: string,
		public folders: SyncThingFolder[],
		public devices: SyncThingDevice[],
		public syncthingBaseUrl: string
	) {}
}

/**
 * Available sync types in Syncthing.
 * @see https://docs.syncthing.net/users/config.html#config-option-folder.type
 */
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
		/**
		 * The folder ID.
		 * Must be unique.
		 */
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
		/**
		 * The device ID.
		 * @see https://docs.syncthing.net/dev/device-ids.html#device-ids
		 */
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
 * This is the devices' information that is stored in the {@linkcode SyncThingFolder} object.
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

/**
 * Definition of a conflict filename.
 */
export interface ConflictFilename {
	/**
	 * The filename of the file that is in conflict.
	 *
	 * format: filename allowed characters in Obsidian
	 * @example `MyFile`
	 */
	filename: string;
	/**
	 * The date of the conflict, in the format `YYYYMMDD`.
	 *
	 * format: YYYYMMDD
	 * @example `20210930`
	 */
	date: string;
	/**
	 * The time of the conflict, in the format `HHMMSS`.
	 *
	 * format: HHMMSS
	 * @example `123456`
	 */
	time: string;
	/**
	 * Full date and time of the conflict, in the Date format.
	 */
	dateTime: Date;
	/**
	 * The device ID of the device that modified the file. it is a reduced version of {@linkcode SyncThingDevice.deviceID}
	 *
	 * format: reduced device ID (7 characters)
	 * @example `ABCDEF1`
	 */
	modifiedBy: string; // format: reduced device ID (7 characters)
	/**
	 * The file extension of the file that is in conflict.
	 *
	 * format: file extension
	 * @example `md`
	 */
	extension: string;
}

// TODO: add all entities necessary from Syncthing API (REST/CLI) to the integration in Obsidian.
