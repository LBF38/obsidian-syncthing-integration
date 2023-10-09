import { dateSchema } from "src/controllers/utils";
import {
	BaseSchema,
	Output,
	array,
	boolean,
	literal,
	nullType,
	nullable,
	number,
	object,
	record,
	string,
	union,
} from "valibot";
import { SyncthingConfiguration } from "./entities";

export const SyncthingEventTypes = union([
	literal("ClusterConfigReceived"),
	literal("ConfigSaved"),
	literal("DeviceConnected"),
	literal("DeviceDisconnected"),
	literal("DeviceDiscovered"),
	literal("DevicePaused"),
	literal("DeviceResumed"),
	literal("DownloadProgress"),
	literal("Failure"),
	literal("FolderCompletion"),
	literal("FolderErrors"),
	literal("FolderPaused"),
	literal("FolderResumed"),
	literal("FolderScanProgress"),
	literal("FolderSummary"),
	literal("FolderWatchStateChanged"),
	literal("ItemFinished"),
	literal("ItemStarted"),
	literal("ListenAddressesChanged"),
	literal("LocalChangeDetected"),
	literal("LocalIndexUpdated"),
	literal("LoginAttempt"),
	literal("PendingDevicesChanged"),
	literal("PendingFoldersChanged"),
	literal("RemoteChangeDetected"),
	literal("RemoteDownloadProgress"),
	literal("RemoteIndexUpdated"),
	literal("Starting"),
	literal("StartupComplete"),
	literal("StateChanged"),
]);

export function SyncthingGenericEvent<
	T extends BaseSchema,
	K extends Output<typeof SyncthingEventTypes>
>(typeSchema: K, dataSchema: T) {
	return object({
		id: number(),
		globalID: number(),
		type: literal(typeSchema),
		time: dateSchema,
		data: dataSchema,
	});
}

// TODO: implement all events.
// export const SyncthingEvent = SyncthingGenericEvent();

export const ClusterConfigReceived = SyncthingGenericEvent(
	"ClusterConfigReceived",
	object({
		device: string(),
	})
);

export const ConfigSaved = SyncthingGenericEvent(
	"ConfigSaved",
	SyncthingConfiguration
);

export const DeviceConnected = SyncthingGenericEvent(
	"DeviceConnected",
	object({
		addr: string(),
		id: string(),
		deviceName: string(),
		clientName: string(),
		clientVersion: string(),
		type: string(), // TODO: more granular validation.
	})
);

export const DeviceDisconnected = SyncthingGenericEvent(
	"DeviceDisconnected",
	object({ error: string(), id: string() })
);

export const DeviceDiscovered = SyncthingGenericEvent(
	"DeviceDiscovered",
	object({ addrs: array(string()), device: string() })
);

export const DevicePaused = SyncthingGenericEvent(
	"DevicePaused",
	object({ device: string() })
);

export const DeviceResumed = SyncthingGenericEvent(
	"DeviceResumed",
	object({ device: string() })
);

export const DownloadProgress = SyncthingGenericEvent(
	"DownloadProgress",
	record(
		record(
			object({
				total: number(),
				pulling: number(),
				copiedFromOrigin: number(),
				reused: number(),
				copiedFromElsewhere: number(),
				pulled: number(),
				bytesTotal: number(),
				bytesDone: number(),
			})
		)
	)
);

export const Failure = SyncthingGenericEvent("Failure", string());

export const FolderCompletion = SyncthingGenericEvent(
	"FolderCompletion",
	object({
		completion: number(),
		device: string(),
		folder: string(),
		globalBytes: number(),
		globalItems: number(),
		needBytes: number(),
		needDeletes: number(),
		needItems: number(),
		remoteState: string(),
		sequence: number(),
	})
);

export const FolderErrors = SyncthingGenericEvent(
	"FolderErrors",
	object({
		errors: array(object({ error: string(), path: string() })),
		folder: string(),
	})
);

export const FolderPaused = SyncthingGenericEvent(
	"FolderPaused",
	object({ id: string(), label: string() })
);

export const FolderResumed = SyncthingGenericEvent(
	"FolderResumed",
	object({ id: string(), label: string() })
);

export const FolderScanProgress = SyncthingGenericEvent(
	"FolderScanProgress",
	object({
		total: number(),
		rate: number(),
		current: number(),
		folder: string(),
	})
);

export const FolderSummary = SyncthingGenericEvent(
	"FolderSummary",
	object({
		folder: string(),
		summary: object({
			globalBytes: number(),
			globalDeleted: number(),
			globalFiles: number(),
			ignorePatterns: boolean(),
			inSyncBytes: number(),
			inSyncFiles: number(),
			invalid: string(),
			localBytes: number(),
			localDeleted: number(),
			localFiles: number(),
			needBytes: number(),
			needFiles: number(),
			state: string(),
			stateChanged: dateSchema,
			version: number(),
		}),
	})
);

export const FolderWatchStateChanged = SyncthingGenericEvent(
	"FolderWatchStateChanged",
	object({ folder: string(), from: string(), to: string() })
);

const ItemSchema = object({
	item: string(),
	folder: string(),
	error: nullable(string()),
	type: string(),
	action: union([literal("delete"), literal("update"), literal("metadata")]),
});

export const ItemFinished = SyncthingGenericEvent("ItemFinished", ItemSchema);

export const ItemStarted = SyncthingGenericEvent("ItemStarted", ItemSchema);
// TODO: ^ verify that the schema is correct. (especially the "error" field, else "Omit" it.)

export const ListenAddressesChanged = SyncthingGenericEvent(
	"ListenAddressesChanged",
	object({
		address: object({
			Fragment: string(),
			RawQuery: string(),
			Scheme: string(),
			Path: string(),
			RawPath: string(),
			User: nullable(string()),
			ForceQuery: boolean(),
			Host: string(),
			Opaque: string(),
		}),
		wan: array(
			object({
				ForceQuery: boolean(),
				User: nullable(string()),
				Host: string(),
				Opaque: string(),
				Path: string(),
				RawPath: string(),
				RawQuery: string(),
				Scheme: string(),
				Fragment: string(),
			})
		),
		lan: array(
			object({
				RawQuery: string(),
				Scheme: string(),
				Fragment: string(),
				RawPath: string(),
				Path: string(),
				Host: string(),
				Opaque: string(),
				ForceQuery: boolean(),
				User: nullable(string()),
			})
		),
	})
);

export const LocalChangeDetected = SyncthingGenericEvent(
	"LocalChangeDetected",
	object({
		action: string(),
		folder: string(),
		label: string(),
		path: string(),
		type: string(),
	})
);

export const LocalIndexUpdated = SyncthingGenericEvent(
	"LocalIndexUpdated",
	object({
		folder: string(),
		items: number(),
		filenames: array(string()),
		sequence: number(),
		version: number(),
	})
);

export const LoginAttempt = SyncthingGenericEvent(
	"LoginAttempt",
	object({ remoteAddress: string(), username: string(), success: boolean() })
);

export const PendingDevicesChanged = SyncthingGenericEvent(
	"PendingDevicesChanged",
	object({
		added: array(
			object({
				address: string(),
				deviceID: string(),
				name: string(),
			})
		),
		removed: array(object({ deviceID: string() })),
	})
);

export const PendingFoldersChanged = SyncthingGenericEvent(
	"PendingFoldersChanged",
	object({
		added: array(
			object({
				deviceID: string(),
				folderID: string(),
				folderLabel: string(),
				receiveEncrypted: boolean(),
				remoteEncrypted: boolean(),
			})
		),
		removed: array(object({ deviceID: string(), folderID: string() })),
	})
);

export const RemoteChangeDetected = SyncthingGenericEvent(
	"RemoteChangeDetected",
	object({
		type: string(),
		action: string(),
		folder: string(),
		path: string(),
		label: string(),
		modifiedBy: string(),
	})
);

export const RemoteDownloadProgress = SyncthingGenericEvent(
	"RemoteDownloadProgress",
	object({ state: record(number()), device: string(), folder: string() })
);

export const RemoteIndexUpdated = SyncthingGenericEvent(
	"RemoteIndexUpdated",
	object({ device: string(), folder: string(), items: number() })
);

export const Starting = SyncthingGenericEvent(
	"Starting",
	object({ home: string() })
);

export const StartupComplete = SyncthingGenericEvent(
	"StartupComplete",
	nullType()
);

export const StateChanged = SyncthingGenericEvent(
	"StateChanged",
	object({
		folder: string(),
		from: string(),
		duration: number(),
		to: string(),
	})
);
