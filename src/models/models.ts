import { isStringArray, logErrorIfNotValidJson } from "src/controllers/utils";
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
		logErrorIfNotValidJson(parsedJSON, "version", "string");
		if (
			!(
				(
					"folders" in parsedJSON &&
					Array.isArray(parsedJSON["folders"])
				)
				// TODO: validate the custom type.
			) ||
			!("devices" in parsedJSON && Array.isArray(parsedJSON["devices"]))
			// TODO: validate the custom type.
		)
			throw new Error("Error parsing JSON: missing fields or wrong type");
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
		const reducedDeviceInfos: ReducedSyncthingDeviceModel[] = [];
		// TODO: to refactor w/ a function.
		if (!(typeof parsedJSON === "object" && parsedJSON !== null))
			throw new Error("JSON is not an object or is null");
		logErrorIfNotValidJson(parsedJSON, "id", "string");
		logErrorIfNotValidJson(parsedJSON, "label", "string");
		logErrorIfNotValidJson(parsedJSON, "path", "string");
		logErrorIfNotValidJson(parsedJSON, "filesystemType", "string");
		logErrorIfNotValidJson(parsedJSON, "type", "string");
		logErrorIfNotValidJson(parsedJSON, "maxConflicts", 0);
		if (!("devices" in parsedJSON && Array.isArray(parsedJSON["devices"])))
			throw new Error(
				"Error validating JSON: devices is not present or is not an array"
			);
		for (const device of parsedJSON["devices"]) {
			reducedDeviceInfos.push(
				ReducedSyncthingDeviceModel.fromJSON(JSON.stringify(device))
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
		logErrorIfNotValidJson(parsedJSON, "deviceID", "string");
		logErrorIfNotValidJson(parsedJSON, "introducedBy", "string");
		logErrorIfNotValidJson(parsedJSON, "paused", true);
		if (
			!(
				"addresses" in parsedJSON &&
				isStringArray(parsedJSON["addresses"])
			) ||
			!(
				("ignoredFolders" in parsedJSON) /*&&*/
				// 	(isStringArray(parsedJSON["ignoredFolders"]) ||
				// 		Array.isArray(
				// 			parsedJSON["ignoredFolders"] &&
				// 				(parsedJSON["ignoredFolders"] as Array<string>)
				// 					.length === 0
				// 		))
			) ||
			!(
				"name" in parsedJSON &&
				(typeof parsedJSON["name"] === "string" ||
					typeof parsedJSON["name"] === "undefined")
			)
		)
			throw new Error("Error validating JSON");
		return new SyncthingDeviceModel(
			parsedJSON["deviceID"],
			parsedJSON["introducedBy"],
			parsedJSON["addresses"],
			parsedJSON["paused"],
			parsedJSON["ignoredFolders"] as Array<string>, // TODO: refactor this.
			parsedJSON["name"] ?? ""
		);
	}

	toJSON(): string {
		return JSON.stringify(this);
	}
}

export class ReducedSyncthingDeviceModel extends ReducedSyncthingDevice {
	static fromJSON(json: string): ReducedSyncthingDeviceModel {
		const parsedJSON = JSON.parse(json);
		if (!(typeof parsedJSON === "object" && parsedJSON !== null))
			throw new Error("Error parsing JSON");
		logErrorIfNotValidJson(parsedJSON, "deviceID", "string");
		logErrorIfNotValidJson(parsedJSON, "introducedBy", "string");
		logErrorIfNotValidJson(parsedJSON, "encryptionPassword", "string");
		return new ReducedSyncthingDeviceModel(
			parsedJSON["deviceID"],
			parsedJSON["introducedBy"],
			parsedJSON["encryptionPassword"]
		);
	}

	toJSON(): string {
		return JSON.stringify(this);
	}
}
