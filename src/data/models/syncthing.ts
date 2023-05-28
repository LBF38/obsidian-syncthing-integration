import {
	ReducedSyncThingDevice,
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/domain/entities/syncthing";

export class SyncThingConfigurationModel extends SyncThingConfiguration {
	constructor(
		version: string,
		folders: SyncThingFolder[],
		devices: SyncThingDevice[]
	) {
		super(version, folders, devices);
	}

	static fromJSON(json: string): SyncThingConfigurationModel {
		const parsedJSON = JSON.parse(json);
		const folders: SyncThingFolder[] = [];
		for (const parsedFolder of parsedJSON["folders"]) {
			const reducedDeviceInfos: ReducedSyncThingDevice[] = [];
			for (const device of parsedFolder["devices"]) {
				reducedDeviceInfos.push(
					new ReducedSyncThingDevice(
						device["deviceID"],
						device["introducedBy"],
						device["encryptionPassword"]
					)
				);
			}
			const folder = new SyncThingFolder(
				parsedFolder["id"],
				parsedFolder["label"],
				parsedFolder["path"],
				parsedFolder["filesystemType"],
				parsedFolder["type"],
				reducedDeviceInfos,
				parsedFolder["maxConflicts"]
			);
			folders.push(folder);
		}
		const devices: SyncThingDevice[] = [];
		for (const device of parsedJSON["devices"]) {
			devices.push(
				new SyncThingDevice(
					device["deviceID"],
					device["introducedBy"],
					device["encryptionPassword"],
					device["addresses"],
					device["paused"],
					device["ignoredFolders"],
					device["name"] ?? ""
				)
			);
		}
		return new SyncThingConfigurationModel(
			parsedJSON["version"],
			folders,
			devices
		);
	}

	toJSON(): string {
		return JSON.stringify(this);
	}
}
