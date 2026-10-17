import { dateSchema } from "src/controllers/utils";
import {
	array,
	boolean,
	literal,
	nullable,
	number,
	object,
	optional,
	pick,
	record,
	string,
	undefinedType,
	union,
} from "valibot";

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
export const SyncTypes = union([
	literal("sendreceive"),
	literal("sendonly"),
	literal("receiveonly"),
	literal("receiveencrypted"),
]);

/**
 * Syncthing device object.
 *
 * This is a minimalist version of the actual device object retrieved from the API.
 * @see https://docs.syncthing.net/users/config.html#device-element
 */
export const SyncthingDevice = object({
	/**
	 * The device ID.
	 * @see https://docs.syncthing.net/dev/device-ids.html#device-ids
	 */
	deviceID: string(),
	introducedBy: string(),
	// encryptionPassword: string(), // TODO: move to the Folder element.
	addresses: array(string()),
	paused: boolean(),
	ignoredFolders: array(string()),
	name: string(),
});

/**
 * This is the devices' information that is stored in the {@linkcode SyncthingFolder} object.
 */
export const ReducedSyncthingDevice = pick(SyncthingDevice, [
	"deviceID",
	"introducedBy",
]);

/**
 * Syncthing folder object.
 *
 * This is a minimalist version of the actual folder object retrieved from the API.
 * @see https://docs.syncthing.net/users/config.html#folder-element
 */
export const SyncthingFolder = object({
	/**
	 * The folder ID.
	 * Must be unique.
	 */
	id: string(),
	label: string(),
	path: string(),
	filesystemType: string(),
	type: SyncTypes,
	devices: array(ReducedSyncthingDevice),
	maxConflicts: number(),
});

/**
 * Syncthing configuration object.
 *
 * This is a minimalist version of the actual configuration object retrieved from the API.
 * It should be reflecting the json response from the `/rest/config/` endpoint.
 * @see https://docs.syncthing.net/users/config.html#config-file-format
 */
export const SyncthingConfiguration = object({
	/**
	 * The configuration's version
	 * @see https://docs.syncthing.net/users/config.html#config-option-configuration.version
	 */
	version: number(),
	folders: array(SyncthingFolder),
	devices: array(SyncthingDevice),
	gui: object({
		enabled: boolean(),
		address: string(),
		unixSocketPermissions: string(),
		user: string(),
		password: string(),
		authMode: string(),
		useTLS: boolean(),
		apiKey: string(),
		insecureAdminAccess: boolean(),
		theme: string(),
		debugging: boolean(),
		insecureSkipHostcheck: boolean(),
		insecureAllowFrameLoading: boolean(),
	}),
	ldap: object({
		address: string(),
		bindDN: string(),
		transport: string(),
		insecureSkipVerify: boolean(),
		searchBaseDN: string(),
		searchFilter: string(),
	}),
	options: object({
		listenAddresses: array(string()),
		globalAnnounceServers: array(string()),
		globalAnnounceEnabled: boolean(),
		localAnnounceEnabled: boolean(),
		localAnnouncePort: number(),
		localAnnounceMCAddr: string(),
		maxSendKbps: number(),
		maxRecvKbps: number(),
		reconnectionIntervalS: number(),
		relaysEnabled: boolean(),
		relayReconnectIntervalM: number(),
		startBrowser: boolean(),
		natEnabled: boolean(),
		natLeaseMinutes: number(),
		natRenewalMinutes: number(),
		natTimeoutSeconds: number(),
		urAccepted: number(),
		urSeen: number(),
		urUniqueId: string(),
		urURL: string(),
		urPostInsecurely: boolean(),
		urInitialDelayS: number(),
		autoUpgradeIntervalH: number(),
		upgradeToPreReleases: boolean(),
		keepTemporariesH: number(),
		cacheIgnoredFiles: boolean(),
		progressUpdateIntervalS: number(),
		limitBandwidthInLan: boolean(),
		minHomeDiskFree: object({
			value: number(),
			unit: string(),
		}),
		releasesURL: string(),
		alwaysLocalNets: array(string()),
		overwriteRemoteDeviceNamesOnConnect: boolean(),
		tempIndexMinBlocks: number(),
		unackedNotificationIDs: array(string()),
		trafficClass: number(),
		setLowPriority: boolean(),
		maxFolderConcurrency: number(),
		crURL: string(),
		crashReportingEnabled: boolean(),
		stunKeepaliveStartS: number(),
		stunKeepaliveMinS: number(),
		stunServers: array(string()),
		databaseTuning: string(),
		maxConcurrentIncomingRequestKiB: number(),
		announceLANAddresses: boolean(),
		sendFullIndexOnUpgrade: boolean(),
		featureFlags: array(string()),
		connectionLimitEnough: number(),
		connectionLimitMax: number(),
		insecureAllowOldTLSVersions: boolean(),
	}),
	remoteIgnoredDevices: array(string()),
	defaults: object({
		folder: SyncthingFolder,
		device: SyncthingDevice,
		ignores: object({ lines: array(string()) }),
	}),
});

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
			when: dateSchema,
			error: nullable(string()),
			ok: union([boolean(), undefinedType()]),
		})
	),
	myID: string(),
	pathSeparator: string(),
	startTime: dateSchema,
	sys: number(),
	themes: optional(array(string())),
	tilde: string(),
	uptime: number(),
	urVersionMax: number(),
});

export const SyncthingVersion = object({
	arch: string(),
	longVersion: string(),
	os: string(),
	version: string(),
});

export const SyncthingDeviceStats = record(
	object({
		lastSeen: dateSchema,
		lastConnectionDurationS: number(),
	})
);

export const SyncthingFolderStats = record(
	object({
		lastScan: dateSchema,
		lastFile: object({
			filename: string(),
			at: dateSchema,
		}),
	})
);

// TODO: add all entities necessary from Syncthing API (REST/CLI) to the integration in Obsidian.
