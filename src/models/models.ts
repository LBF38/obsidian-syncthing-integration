import { isStringArray } from "src/controllers/utils";
import {
	ReducedSyncthingDevice,
	SyncTypes,
	SyncthingConfiguration,
	SyncthingDevice,
	SyncthingFolder,
	SyncthingURL,
} from "src/models/entities";

export class SyncthingConfigurationModel extends SyncthingConfiguration {
	constructor(
		version: string,
		folders: SyncthingFolder[],
		devices: SyncthingDevice[],
		url: SyncthingURL = {
			protocol: "http",
			ip_address: "localhost",
			port: 8384,
		}
	) {
		super(version, folders, devices, url);
	}

	/**
	 * The static method to parse a JSON string and return a model object.
	 * @param json - The JSON string to parse.
	 */
	static fromJSON(json: string): SyncthingConfigurationModel {
		const parsedJSON = JSON.parse(json);
		const folders: SyncthingFolder[] = [];
		if (!(typeof parsedJSON === "object" && parsedJSON !== null))
			throw new Error("JSON is not an object or is null");
		if (
			!(
				"folders" in parsedJSON && Array.isArray(parsedJSON["folders"])
			) ||
			!(
				"devices" in parsedJSON && Array.isArray(parsedJSON["devices"])
			) ||
			!(
				"version" in parsedJSON &&
				typeof parsedJSON["version"] === "string"
			)
		)
			throw new Error("Error parsing JSON");
		for (const parsedFolder of parsedJSON["folders"]) {
			console.log(parsedFolder);
			folders.push(
				SyncthingFolderModel.fromJSON(JSON.stringify(parsedFolder))
			);
		}
		const devices: SyncthingDevice[] = [];
		for (const parsedDevice of parsedJSON["devices"]) {
			devices.push(
				SyncthingDeviceModel.fromJSON(JSON.stringify(parsedDevice))
			);
		}
		return new SyncthingConfigurationModel(
			parsedJSON["version"],
			folders,
			devices
		);
	}

	/**
	 * The method to convert a model object to a JSON string.
	 */
	toJSON(): string {
		return JSON.stringify(this);
	}
}

export class SyncthingFolderModel extends SyncthingFolder {
	static fromJSON(json: string): SyncthingFolderModel {
		const parsedJSON = JSON.parse(json);
		const reducedDeviceInfos: ReducedSyncthingDevice[] = [];
		// TODO: to refactor w/ a function.
		if (!(typeof parsedJSON === "object" && parsedJSON !== null))
			throw new Error("JSON is not an object or is null");
		if (
			!(
				"folders" in parsedJSON && Array.isArray(parsedJSON["folders"])
			) ||
			!(
				"devices" in parsedJSON && Array.isArray(parsedJSON["devices"])
			) ||
			!("id" in parsedJSON && typeof parsedJSON["id"] === "string") ||
			!(
				"label" in parsedJSON && typeof parsedJSON["label"] === "string"
			) ||
			!("path" in parsedJSON && typeof parsedJSON["path"] === "string") ||
			!(
				"filesystemType" in parsedJSON &&
				typeof parsedJSON["filesystemType"] === "string"
			) ||
			!("type" in parsedJSON && typeof parsedJSON["type"] === "string") ||
			!(
				"maxConflicts" in parsedJSON &&
				typeof parsedJSON["maxConflicts"] === "number"
			)
		)
			throw new Error("Error parsing JSON");
		for (const device of parsedJSON["devices"]) {
			// TODO: to refactor w/ a function.
			if (!(typeof device === "object" && device !== null))
				throw new Error("Error parsing JSON");
			if (
				!(
					"deviceID" in device &&
					typeof device["deviceID"] === "string"
				)
			)
				throw new Error("Error parsing JSON");
			if (
				!(
					"introducedBy" in device &&
					typeof device["introducedBy"] === "string"
				)
			)
				throw new Error("Error parsing JSON");
			if (
				!(
					"encryptionPassword" in device &&
					typeof device["encryptionPassword"] === "string"
				)
			)
				throw new Error("Error parsing JSON");
			reducedDeviceInfos.push(
				new ReducedSyncthingDevice(
					device["deviceID"],
					device["introducedBy"],
					device["encryptionPassword"]
				)
			);
		}
		return new SyncthingFolderModel(
			parsedJSON["id"],
			parsedJSON["label"],
			parsedJSON["path"],
			parsedJSON["filesystemType"],
			parsedJSON["type"] as SyncTypes,
			// TODO: refactor this ^ w/ a type guard. See https://stackoverflow.com/a/51529486/20502385
			reducedDeviceInfos,
			parsedJSON["maxConflicts"]
		);
	}

	toJSON(): string {
		return JSON.stringify(this);
	}
}

export class SyncthingDeviceModel extends SyncthingDevice {
	static fromJSON(json: string): SyncthingDeviceModel {
		const parsedJSON = JSON.parse(json);
		// TODO: to refactor w/ a function.
		if (!(typeof parsedJSON === "object" && parsedJSON !== null))
			throw new Error("JSON is not an object or is null");
		if (
			!(
				"addresses" in parsedJSON &&
				isStringArray(parsedJSON["addresses"])
			) ||
			!(
				"ignoredFolders" in parsedJSON &&
				isStringArray(parsedJSON["ignoredFolders"])
			) ||
			!(
				"deviceID" in parsedJSON &&
				typeof parsedJSON["deviceID"] === "string"
			) ||
			!(
				"introducedBy" in parsedJSON &&
				typeof parsedJSON["introducedBy"] === "string"
			) ||
			!(
				"encryptionPassword" in parsedJSON &&
				typeof parsedJSON["encryptionPassword"] === "string"
			) ||
			!(
				"name" in parsedJSON &&
				typeof parsedJSON["name"] === "string" &&
				typeof parsedJSON["name"] === "undefined"
			) ||
			!("type" in parsedJSON && typeof parsedJSON["type"] === "string") ||
			!(
				"maxConflicts" in parsedJSON &&
				typeof parsedJSON["maxConflicts"] === "number"
			) ||
			!(
				"paused" in parsedJSON &&
				typeof parsedJSON["paused"] === "boolean"
			)
		)
			throw new Error("Error parsing JSON");
		return new SyncthingDeviceModel(
			parsedJSON["deviceID"],
			parsedJSON["introducedBy"],
			parsedJSON["encryptionPassword"],
			parsedJSON["addresses"],
			parsedJSON["paused"],
			parsedJSON["ignoredFolders"],
			parsedJSON["name"] ?? ""
		);
	}

	toJSON(): string {
		return JSON.stringify(this);
	}
}
