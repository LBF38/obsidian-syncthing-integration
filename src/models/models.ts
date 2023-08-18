import {
	ReducedSyncthingDevice,
	SyncthingConfiguration,
	SyncthingDevice,
	SyncthingFolder,
} from "src/models/entities";

export class SyncthingConfigurationModel extends SyncthingConfiguration {
	constructor(
		version: string,
		folders: SyncthingFolder[],
		devices: SyncthingDevice[],
		syncthingBaseUrl = "localhost:8384"
	) {
		super(version, folders, devices, syncthingBaseUrl);
	}

	/**
	 * The static method to parse a JSON string and return a model object.
	 * @param json - The JSON string to parse.
	 */
	static fromJSON(json: string): SyncthingConfigurationModel {
		const parsedJSON = JSON.parse(json);
		const folders: SyncthingFolder[] = [];
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
		for (const device of parsedJSON["devices"]) {
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
			parsedJSON["type"],
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
