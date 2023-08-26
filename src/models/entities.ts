import {
	array,
	boolean,
	date,
	minValue,
	nullable,
	number,
	object,
	optional,
	record,
	string,
	transform,
	undefinedType,
	union,
} from "valibot";

/**
 * Syncthing configuration object.
 *
 * This is a minimalist version of the actual configuration object retrieved from the API.
 * It should be reflecting the json response from the `/rest/config/` endpoint.
 * @see https://docs.syncthing.net/users/config.html#config-file-format
 */
export class SyncthingConfiguration {
	constructor(
		/**
		 * The configuration's version
		 * @see https://docs.syncthing.net/users/config.html#config-option-configuration.version
		 */
		public version: string,
		public folders: SyncthingFolder[],
		public devices: SyncthingDevice[],
		public url: SyncthingURL
	) {}
}

/**
 * Simple URL object.
 */
export type SyncthingURL = {
	protocol: "https" | "http";
	ip_address: string | "localhost";
	port: number;
};

/**
 * Available sync types in Syncthing.
 * @see https://docs.syncthing.net/users/config.html#config-option-folder.type
 */
export type SyncTypes =
	| "sendreceive"
	| "sendonly"
	| "receiveonly"
	| "receiveencrypted";

/**
 * Syncthing folder object.
 *
 * This is a minimalist version of the actual folder object retrieved from the API.
 * @see https://docs.syncthing.net/users/config.html#folder-element
 */
export class SyncthingFolder {
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
		public devices: ReducedSyncthingDevice[],
		public maxConflicts: number
	) {}
}

/**
 * Syncthing device object.
 *
 * This is a minimalist version of the actual device object retrieved from the API.
 * @see https://docs.syncthing.net/users/config.html#device-element
 */
export class SyncthingDevice {
	constructor(
		/**
		 * The device ID.
		 * @see https://docs.syncthing.net/dev/device-ids.html#device-ids
		 */
		public deviceID: string,
		public introducedBy: string,
		// public encryptionPassword: string, // TODO: move to the Folder element.
		public address: string[],
		public paused: boolean,
		public ignoredFolders: string[],
		public name?: string
	) {}
}

/**
 * This is the devices' information that is stored in the {@linkcode SyncthingFolder} object.
 */
export class ReducedSyncthingDevice
	implements
		Pick<
			SyncthingDevice,
			"deviceID" | "introducedBy" /* | "encryptionPassword" */
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
	 * The device ID of the device that modified the file. it is a reduced version of {@linkcode SyncthingDevice.deviceID}
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

/**
 * Creates a complete, customizable validation function that validates a datetime.
 *
 * The correct number of days in a month is validated, including leap year.
 *
 * Date Format: yyyy-mm-dd
 * Time Formats: [T]hh:mm[:ss[.sss]][+/-hh:mm] or [T]hh:mm[:ss[.sss]][Z]
 *
 * @param {Object} options The configuration options.
 * @param {boolean} options.date Whether to validate the date.
 * @param {boolean} options.time Whether to validate the time.
 * @param {boolean} options.seconds Whether to validate the seconds.
 * @param {boolean} options.milliseconds Whether to validate the milliseconds.
 * @param {boolean} options.timezone Whether to validate the timezone.
 * @param {string} error The error message.
 *
 * @returns A validation function.
 */
export function iso<TInput extends string>(options?: {
	date?: boolean;
	time?: boolean;
	seconds?: boolean;
	milliseconds?: boolean;
	timezone?: boolean;
	error?: string;
}) {
	return (input: TInput) => {
		// override default date and time options to true if options is undefined
		const {
			date = false,
			time = false,
			seconds = true,
			milliseconds = true,
			timezone = true,
			error = "Invalid ISO string",
		} = options || { date: true, time: true };

		const dateRegex = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
		const timeRegex = `([01]\\d|2[0-3]):[0-5]\\d:${
			seconds ? `[0-5]\\d${milliseconds ? "\\.\\d{3}" : ""}` : ""
		}${timezone ? "([+-]([01]\\d|2[0-3]):[0-5]\\d|Z)" : ""}`;
		const regex = new RegExp(
			`^${date ? dateRegex : ""}${date && time ? "T" : time ? "T?" : ""}${
				time ? timeRegex : ""
			}$`
		);

		if (!regex.test(input)) {
			return {
				issue: {
					validation: "iso",
					message: error,
					input,
				},
			};
		}
		return { output: input };
	};
}

// Transforms a Date, string, or number into a Date
export const dateValidation = transform(
	// Input types: Date, string, number
	union(
		[
			date(),
			string([iso({ date: true, time: true, milliseconds: false })]),
			number([minValue(0)]),
		],
		"Must be a valid Date object, ISO string, or UNIX timestamp"
	),
	// Output type: Date
	(input) => new Date(input)
);

/**
 * Syncthing System Status.
 * @see https://docs.syncthing.net/rest/system-status-get.html
 */
export const SyncthingSystemStatus = object({
	alloc: number(),
	connectionServiceStatus: record(
		object({
			error: nullable(string()),
			lanAddresses: array(string()),
			wanAddresses: array(string()),
		})
	),
	discoveryEnabled: boolean(),
	discoveryErrors: record(string()),
	discoveryStatus: record(
		object({
			error: nullable(string()),
		})
	),
	discoveryMethods: number(),
	goroutines: number(),
	guiAddressOverridden: boolean(),
	guiAddressUsed: string(),
	lastDialStatus: record(
		object({
			when: dateValidation,
			error: nullable(string()),
			ok: union([boolean(), undefinedType()]),
		})
	),
	myID: string(),
	pathSeparator: string(),
	startTime: dateValidation,
	sys: number(),
	themes: optional(array(string())),
	tilde: string(),
	uptime: number(),
	urVersionMax: number(),
});

// TODO: add all entities necessary from Syncthing API (REST/CLI) to the integration in Obsidian.
