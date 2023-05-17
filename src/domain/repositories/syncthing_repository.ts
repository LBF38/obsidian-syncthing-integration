import { Failure } from "src/core/errors/failures";
import {
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "../entities/syncthing";

export interface SyncThingRepository {
	getConfiguration(): Promise<SyncThingConfiguration | Failure>;
	getDevices(): Promise<SyncThingDevice[] | Failure>;
	getFolders(): Promise<SyncThingFolder[] | Failure>;
	startSyncThing(): Promise<boolean | Failure>;
	stopSyncThing(): Promise<boolean | Failure>;
}
