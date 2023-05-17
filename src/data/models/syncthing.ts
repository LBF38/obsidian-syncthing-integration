import {
	ReducedSyncThingDevice,
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/domain/entities/syncthing";

export class SyncThingConfigurationModel extends SyncThingConfiguration {
	constructor(folders: SyncThingFolder[], devices: SyncThingDevice[]) {
		super(folders, devices);
	}

	static fromJson(json: string): SyncThingConfigurationModel {
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
		return this.caller(parsedJSON["folders"], parsedJSON["devices"]);
	}

	toJson(): string {
		return JSON.stringify(this);
	}
}
