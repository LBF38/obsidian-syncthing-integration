import { Failure, RestFailure } from "src/models/failures";
import {
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/models/syncthing_entities";
import { SyncThingFromCLI } from "../data/syncthing_local_datasource";
import { SyncThingFromREST } from "../data/syncthing_remote_datasource";
import { TFile } from "obsidian";

export interface SyncthingController {
	/**
	 * Checks if SyncThing is installed on the system.
	 */
	hasSyncThing(): Promise<boolean>;
	/**
	 * Gets the SyncThing configuration.
	 */
	getConfiguration(): Promise<SyncThingConfiguration | Failure>;
	/**
	 * Gets the SyncThing conflicting files.
	 * @see https://docs.syncthing.net/rest/db-conflicts-get.html
	 */
	getConflicts(): Promise<TFile[] | Failure>;
	/**
	 * Gets the SyncThing API key from the CLI.
	 */
	getAPIKey(): Promise<string | Failure>;
	/**
	 * Gets the SyncThing devices.
	 */
	getDevices(): Promise<SyncThingDevice[] | Failure>;
	/**
	 * Gets the SyncThing folders.
	 */
	getFolders(): Promise<SyncThingFolder[] | Failure>;
	/**
	 * Starts the Syncthing service.
	 */
	startSyncThing(): Promise<boolean | Failure>;
	/**
	 * Stops the Syncthing service.
	 */
	stopSyncThing(): Promise<boolean | Failure>;
}

export class SyncthingControllerImpl implements SyncthingController {
	constructor(
		public syncthingFromCLI: SyncThingFromCLI,
		public syncthingFromREST: SyncThingFromREST
	) {}

	async hasSyncThing(): Promise<boolean> {
		return await this.syncthingFromCLI
			.getVersion()
			.then((version) => {
				return true;
			})
			.catch((error) => {
				return false;
			});
	}

	async getConflicts(): Promise<Failure | TFile[]> {
		// return app.vault.getFiles();
		return new RestFailure();
	}

	getAPIKey(): Promise<string | Failure> {
		throw new Error("Method not implemented.");
	}

	async getConfiguration(): Promise<SyncThingConfiguration | Failure> {
		try {
			const config = await this.syncthingFromCLI.getConfiguration();
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
		return this.syncthingFromCLI.startSyncThing();
	}
	stopSyncThing(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
}
