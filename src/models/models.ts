import {
	ReducedSyncThingDevice,
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/models/entities";

export class SyncThingConfigurationModel extends SyncThingConfiguration {
	constructor(
		version: string,
		folders: SyncThingFolder[],
		devices: SyncThingDevice[],
		syncthingBaseUrl = "http://localhost:8384"
	) {
		super(version, folders, devices, syncthingBaseUrl);
	}

	/**
	 * The static method to parse a JSON string and return a model object.
	 * @param json - The JSON string to parse.
	 */
	static fromJSON(json: string): SyncThingConfigurationModel {
		const parsedJSON = JSON.parse(json);
		const folders: SyncThingFolder[] = [];
		for (const parsedFolder of parsedJSON["folders"]) {
			console.log(parsedFolder);
			folders.push(
				SyncThingFolderModel.fromJSON(JSON.stringify(parsedFolder))
			);
		}
		const devices: SyncThingDevice[] = [];
		for (const parsedDevice of parsedJSON["devices"]) {
			devices.push(
				SyncThingDeviceModel.fromJSON(JSON.stringify(parsedDevice))
			);
		}
		return new SyncThingConfigurationModel(
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

export class SyncThingFolderModel extends SyncThingFolder {
	static fromJSON(json: string): SyncThingFolderModel {
		const parsedJSON = JSON.parse(json);
		const reducedDeviceInfos: ReducedSyncThingDevice[] = [];
		for (const device of parsedJSON["devices"]) {
			reducedDeviceInfos.push(
				new ReducedSyncThingDevice(
					device["deviceID"],
					device["introducedBy"],
					device["encryptionPassword"]
				)
			);
		}
		return new SyncThingFolderModel(
			parsedJSON["id"],
			parsedJSON["label"],
			parsedJSON["path"],
			parsedJSON["filesystemType"],
			parsedJSON["type"],
			reducedDeviceInfos,
			parsedJSON["maxConflicts"]
		);
	}

	toJSON(): string {
		return JSON.stringify(this);
	}
}

export class SyncThingDeviceModel extends SyncThingDevice {
	static fromJSON(json: string): SyncThingDeviceModel {
		const parsedJSON = JSON.parse(json);
		return new SyncThingDeviceModel(
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
