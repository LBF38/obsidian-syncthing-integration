import {
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/domain/entities/syncthing";

class SyncThingConfigurationModel extends SyncThingConfiguration {
	constructor(folders: SyncThingFolder[], devices: SyncThingDevice[]) {
		super(folders, devices);
	}

	static fromJson(json: Response): SyncThingConfigurationModel {
		//TODO: Implement this
		throw new Error("Not implemented");
	}

	toJson(): JSON {
		// TODO: Implement this
		throw new Error("Not implemented");
	}
}

export default SyncThingConfigurationModel;
