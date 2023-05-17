import {
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "../entities/syncthing";

export interface SyncThingRepository {
	getConfiguration(): Promise<SyncThingConfiguration>;
	getDevices(): Promise<SyncThingDevice[]>;
	getFolders(): Promise<SyncThingFolder[]>;
	startSyncThing(): Promise<boolean>;
	stopSyncThing(): Promise<boolean>;
}
