import { TFile } from "obsidian";
import MyPlugin from "src/main";
import { Failure, RestFailure } from "src/models/failures";
import {
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/models/syncthing_entities";
import { SyncThingFromCLI } from "../data/syncthing_local_datasource";
import { SyncThingFromREST } from "../data/syncthing_remote_datasource";

export interface SyncthingController {
	plugin: MyPlugin;
	/**
	 * Gets the SyncThing API status.
	 */
	getAPIStatus(): Promise<string>;
	/**
	 * Checks if SyncThing is installed on the system.
	 */
	hasSyncThing(): Promise<boolean>;
	/**
	 * Gets the SyncThing configuration.
	 */
	getConfiguration(): Promise<SyncThingConfiguration | Failure>;
	/**
	 * Gets the SyncThing conflicting files for the ConflictsModal.
	 * It returns a list of all files that are in conflict.
	 * (but only one version of each file, if applicable)
	 * @see https://docs.syncthing.net/users/syncing.html#conflicting-changes
	 */
	getConflicts(): Promise<TFile[] | Failure>;
	/**
	 * Gets the SyncThing conflicting files for the DiffModal.
	 * @see https://docs.syncthing.net/users/syncing.html#conflicting-changes
	 */
	getDiffFiles(file: TFile): Promise<{
		originalFile: TFile;
		conflictingFiles: TFile[] | Failure;
	}>;
	/**
	 * Parses a SyncThing conflict filename.
	 * @returns a {@linkcode ConflictFilename} object if the filename is valid, or a {@linkcode Failure} object if it is not.
	 */
	parseConflictFilename(filename: string): ConflictFilename | Failure;
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

interface ConflictFilename {
	filename: string;
	date: string; // format: YYYYMMDD
	time: string; // format: HHMMSS
	modifiedBy: string; // format: reduced device ID (7 characters)
	extension: string; // format: file extension
}

export class SyncthingControllerImpl implements SyncthingController {
	constructor(
		public syncthingFromCLI: SyncThingFromCLI,
		public syncthingFromREST: SyncThingFromREST,
		public plugin: MyPlugin
	) {}

	async getAPIStatus(): Promise<string> {
		// const response = requestUrl(this.plugin.settings.)
		return "Not implemented.";
	}

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

	async getConflicts(): Promise<TFile[] | Failure> {
		const allFiles = this.plugin.app.vault.getFiles();
		const conflictsFiles = allFiles.filter((currentFile, _, files) => {
			// const reducedFiles = allFiles.filter(
			// 	(file) => file.basename === currentFile.basename
			// );
			return currentFile.name.contains(".sync-conflict");
		});
		if (conflictsFiles.length === 0) {
			return new Failure("No conflicts found.");
		}
		return conflictsFiles;
	}

	parseConflictFilename(filename: string): ConflictFilename | Failure {
		const regex = new RegExp(/(.*).sync-conflict-(\d{8})-(\d{6})-(\w+).(\w+)/);
		const match = regex.exec(filename);
		if (!match) {
			return new Failure("Error parsing conflict filename.");
		}
		return {
			filename: match[1],
			date: match[2],
			time: match[3],
			modifiedBy: match[4],
			extension: match[5],
		};
	}

	async getDiffFiles(entryFile: TFile) {
		const filenameProperties = this.parseConflictFilename(entryFile.name);
		if (filenameProperties instanceof Failure) {
			return {
				originalFile: entryFile,
				conflictingFiles: filenameProperties,
			};
		}
		const allFiles = this.plugin.app.vault.getFiles();
		const conflictsFiles = allFiles.filter((file) => {
			return (
				(file.name.contains(".sync-conflict") &&
					file.name.contains(filenameProperties.filename)) ||
				file.basename === filenameProperties.filename
			);
		});
		const originalFile = conflictsFiles.find(
			(file) => file.basename === filenameProperties.filename
		);
		return {
			originalFile: originalFile ?? entryFile,
			conflictingFiles:
				conflictsFiles.length > 0
					? conflictsFiles
					: new Failure("No conflicts found."),
		};
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
