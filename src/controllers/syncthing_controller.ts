import { Failure, RestFailure } from "src/models/failures";
import {
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/models/syncthing_entities";
import { SyncThingFromCLI } from "../data/datasources/syncthing_local_datasource";
import { SyncThingFromREST } from "../data/datasources/syncthing_remote_datasource";
import { TFile } from "obsidian";

export interface SyncthingController {
	getConfiguration(): Promise<SyncThingConfiguration | Failure>;
	getConflicts(): Promise<TFile[] | Failure>;
	getAPIKey(): Promise<string | Failure>;
	getDevices(): Promise<SyncThingDevice[] | Failure>;
	getFolders(): Promise<SyncThingFolder[] | Failure>;
	startSyncThing(): Promise<boolean | Failure>;
	stopSyncThing(): Promise<boolean | Failure>;
}

export class SyncthingControllerImpl implements SyncthingController {
	constructor(
		public syncthingFromCLI: SyncThingFromCLI,
		public syncthingFromREST: SyncThingFromREST
	) {}

	async getConflicts(): Promise<Failure | TFile[]> {

		// return app.vault.getFiles();
		return new RestFailure();
	}

	getAPIKey(): Promise<string | Failure> {
		throw new Error("Method not implemented.");
	}

	async getConfiguration(): Promise<SyncThingConfiguration | Failure> {
		try {
			const config = await this.syncthingFromREST.getConfiguration();
			return config;
		} catch (error) {
			console.error(error);
			return new RestFailure();
		}
	}
	getDevices(): Promise<SyncThingDevice[]> {
		throw new Error("Method not implemented.");
	}
	getFolders(): Promise<SyncThingFolder[]> {
		throw new Error("Method not implemented.");
	}
	startSyncThing(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	stopSyncThing(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
}
