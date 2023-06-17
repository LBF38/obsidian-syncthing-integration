import { TFile, requestUrl } from "obsidian";
import MyPlugin from "src/main";
import { CliFailure, Failure, RestFailure } from "src/models/failures";
import {
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/models/syncthing_entities";
import { SyncThingFromCLI } from "../data/syncthing_local_datasource";
import { SyncThingFromREST } from "../data/syncthing_remote_datasource";

// TODO: refactor the whole Controller. Needed for better usage in views.

export interface SyncthingController {
	/**
	 * The plugin instance.
	 * To make it easier to call plugin's methods.
	 * @see https://docs.obsidian.md/Reference/TypeScript+API/Plugin/Plugin
	 */
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
	getConflicts(): Promise<Map<string, TFile[]> | Failure>;
	/**
	 * Gets the SyncThing conflicting files for the DiffModal.
	 * @see https://docs.syncthing.net/users/syncing.html#conflicting-changes
	 */
	getDiffFiles(file: TFile): Promise<{
		originalFile: TFile;
		conflictingFiles: TFile[] | Failure;
		conflictingFilesProperties: Map<TFile, ConflictFilename | Failure>;
	}>;
	/**
	 * Parses a SyncThing conflict filename.
	 * The filename format is as follow : `{filename}.sync-conflict-{date}-{time}-{modifiedBy}.{extension}`
	 * The format of each part is as follow :
	 * - `{filename}` : the filename of the file that is in conflict.
	 * - `{date}` : the date of the conflict, in the format `YYYYMMDD`.
	 * - `{time}` : the time of the conflict, in the format `HHMMSS`.
	 * - `{modifiedBy}` : the device ID of the device that modified the file. it is a reduced version of {@linkcode SyncThingDevice.deviceID}
	 * - `{extension}` : the file extension of the file that is in conflict.
	 * @param filename the filename to parse.
	 * @see https://docs.syncthing.net/users/syncing.html#conflicting-changes for the filename format.
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

export interface ConflictFilename {
	/**
	 * The filename of the file that is in conflict.
	 *
	 * format: filename allowed characters in Obsidian
	 * @example `MyFile`
	 */
	filename: string;
	/**
	 * The date of the conflict, in the format `YYYYMMDD`.
	 *
	 * format: YYYYMMDD
	 * @example `20210930`
	 */
	date: string;
	/**
	 * The time of the conflict, in the format `HHMMSS`.
	 *
	 * format: HHMMSS
	 * @example `123456`
	 */
	time: string;
	/**
	 * Full date and time of the conflict, in the Date format.
	 */
	dateTime: Date;
	/**
	 * The device ID of the device that modified the file. it is a reduced version of {@linkcode SyncThingDevice.deviceID}
	 *
	 * format: reduced device ID (7 characters)
	 * @example `ABCDEF1`
	 */
	modifiedBy: string; // format: reduced device ID (7 characters)
	/**
	 * The file extension of the file that is in conflict.
	 *
	 * format: file extension
	 * @example `md`
	 */
	extension: string;
}

export class SyncthingControllerImpl implements SyncthingController {
	constructor(
		public syncthingFromCLI: SyncThingFromCLI,
		public syncthingFromREST: SyncThingFromREST,
		public plugin: MyPlugin
	) {}

	async getAPIStatus(): Promise<string> {
		if (!this.plugin.settings.api_key) {
			return "API key is not set.";
		}
		const response = await requestUrl({
			url:
				this.plugin.settings.configuration.syncthingBaseUrl +
				"/rest/system/ping",
			headers: {
				"X-API-Key": this.plugin.settings.api_key,
				// CORS headers
				"Access-Control-Allow-Origin": "*",
			},
		});
		console.log(response);
		return response.json["ping"];
	}

	async hasSyncThing(): Promise<boolean> {
		// TODO: extract to datasources classes (FromCLI and FromREST)
		return await this.syncthingFromCLI
			.getVersion()
			.then((version) => {
				return true;
			})
			.catch((error) => {
				return false;
			});
	}

	async getConflicts(): Promise<Map<string, TFile[]> | Failure> {
		// Get all conflicting files
		const allFiles = this.plugin.app.vault.getFiles();
		const conflictsFiles = allFiles.filter((currentFile) => {
			return currentFile.name.contains(".sync-conflict");
		});
		if (conflictsFiles.length === 0) {
			return new Failure("No conflicts found.");
		}
		// Reorder conflicting files by filename in a Map
		const conflictsFilesMap = new Map<string, TFile[]>();
		for (const file of conflictsFiles) {
			const filenameProperties = this.parseConflictFilename(file.name);
			if (filenameProperties instanceof Failure) {
				return filenameProperties;
			}
			const filename = filenameProperties.filename;
			if (conflictsFilesMap.has(filename)) {
				conflictsFilesMap.get(filename)!.push(file);
				continue;
			}
			conflictsFilesMap.set(filename, [file]);
		}
		return conflictsFilesMap;
	}

	parseConflictFilename(filename: string): ConflictFilename | Failure {
		const regex = new RegExp(
			/(.*).sync-conflict-(\d{8})-(\d{6})-(\w+).(\w+)/
		);
		const match = regex.exec(filename);
		if (!match) {
			return new Failure(`Error parsing conflict filename : ${filename}`);
		}
		return {
			filename: match[1],
			date: match[2],
			time: match[3],
			dateTime: new Date(
				`${match[2].slice(0, 4)}-${match[2].slice(
					4,
					6
				)}-${match[2].slice(6, 8)}T${match[3].slice(
					0,
					2
				)}:${match[3].slice(2, 4)}:${match[3].slice(4, 6)}`
			),
			modifiedBy: match[4],
			extension: match[5],
		};
	}

	async getDiffFiles(file: TFile) {
		const filenameProperties = this.parseConflictFilename(file.name);
		if (filenameProperties instanceof Failure) {
			return {
				originalFile: file,
				conflictingFiles: filenameProperties,
				conflictingFilesProperties: new Map<TFile, Failure>().set(
					file,
					filenameProperties
				),
			};
		}
		const allFiles = this.plugin.app.vault.getFiles();
		const conflictsFiles = allFiles.filter((currentFile) => {
			return (
				(currentFile.name.contains(".sync-conflict") &&
					currentFile.name.contains(filenameProperties.filename)) ||
				currentFile.basename === filenameProperties.filename
			);
		});
		const originalFile = conflictsFiles.find(
			(currentFile) =>
				currentFile.basename === filenameProperties.filename
		);
		if (originalFile) conflictsFiles.remove(originalFile);
		const result =
			conflictsFiles.length > 0
				? conflictsFiles
				: new Failure("No conflicts found.");
		if (result instanceof Failure) {
			return {
				originalFile: originalFile ? originalFile : file,
				conflictingFiles: result,
				conflictingFilesProperties: new Map<TFile, Failure>().set(
					file,
					result
				),
			};
		}
		const conflictingFilesProperties = new Map<
			TFile,
			Failure | ConflictFilename
		>();
		for (const conflictingFile of conflictsFiles) {
			const properties = this.parseConflictFilename(conflictingFile.name);
			conflictingFilesProperties.set(conflictingFile, properties);
		}
		return {
			originalFile: originalFile ? originalFile : file,
			conflictingFiles: conflictsFiles,
			conflictingFilesProperties: conflictingFilesProperties,
		};
	}

	async getAPIKey(): Promise<string | Failure> {
		if (!this.plugin.settings.api_key) {
			try {
				const apiKey = await this.syncthingFromCLI.getAPIkey();
				if (apiKey) {
					this.plugin.settings.api_key = apiKey;
					await this.plugin.saveSettings();
					return apiKey;
				}
			} catch (error) {
				return new CliFailure("Error getting API key.");
			}
		}
		return this.plugin.settings.api_key;
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
