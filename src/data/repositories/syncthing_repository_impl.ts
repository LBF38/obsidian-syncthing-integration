import { Failure, RestFailure } from "src/core/errors/failures";
import {
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/domain/entities/syncthing";
import { SyncThingRepository } from "src/domain/repositories/syncthing_repository";
import { SyncThingFromCLI } from "../datasources/syncthing_local_datasource";
import { SyncThingFromREST } from "../datasources/syncthing_remote_datasource";

export class SyncThingRepositoryImpl implements SyncThingRepository {
	constructor(
		public syncthingFromCLI: SyncThingFromCLI,
		public syncthingFromREST: SyncThingFromREST
	) {}

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
