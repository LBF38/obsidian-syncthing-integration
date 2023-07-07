import { Platform, TFile } from "obsidian";
import SyncthingPlugin from "src/main";
import {
	ConflictFilename,
	SyncThingConfiguration,
	SyncThingDevice,
	SyncThingFolder,
} from "src/models/entities";
import { CliFailure, Failure, RestFailure } from "src/models/failures";
import { SyncThingFromCLI } from "src/data/syncthing_local_datasource";
import { SyncThingFromREST } from "src/data/syncthing_remote_datasource";
import { SyncthingFromAndroid } from "src/data/syncthing_android_datasource";

export interface SyncthingController {
	/**
	 * The plugin instance.
	 * To make it easier to call plugin's methods.
	 * @see https://docs.obsidian.md/Reference/TypeScript+API/Plugin/Plugin
	 */
	plugin: SyncthingPlugin;
	/**
	 * Gets the SyncThing API status.
	 */
	getAPIStatus(): Promise<string>;
	/**
	 * Gets the Syncthing CLI status.
	 */
	getCLIStatus(): Promise<string>;
	/**
	 * Checks if SyncThing is installed on the system.
	 */
	hasSyncThing(): Promise<boolean>;
	/**
	 * Checks if Syncthing is running.
	 */
	isRunning(): Promise<boolean>;
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

export class SyncthingControllerImpl implements SyncthingController {
	constructor(
		public syncthingFromCLI: SyncThingFromCLI,
		public syncthingFromREST: SyncThingFromREST,
		public syncthingFromAndroid: SyncthingFromAndroid,
		public plugin: SyncthingPlugin
	) {}
	async isRunning(): Promise<boolean> {
		return this.syncthingFromREST
			.ping()
			.then((response) => true)
			.catch((error) => false);
	}
	async getCLIStatus(): Promise<string> {
		return this.syncthingFromCLI
			.getVersion()
			.then((status) => status)
			.catch((error) => "Error: " + error);
	}

	async getAPIStatus(): Promise<string> {
		if (!this.plugin.settings.api_key) {
			return "API key is not set.";
		}
		return await this.syncthingFromREST
			.ping()
			.then((response) => response)
			.catch((error) => "Error: " + error);
	}

	async hasSyncThing(): Promise<boolean> {
		// Mobile support
		if (Platform.isAndroidApp) {
			return await this.syncthingFromAndroid.hasSyncthing();
		} else if (Platform.isIosApp) {
			// IOS not supported.
			return false;
		}
		// Desktop support
		return await this.syncthingFromCLI
			.getVersion()
			.then((version) => {
				return true;
			})
			.catch(async (error) => {
				return await this.syncthingFromREST
					.ping()
					.then((response) => {
						return true;
					})
					.catch((error) => {
						return false;
					});
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
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
		if (Platform.isMobileApp) {
			return new Failure(
				"Cannot get API key on mobile. Please enter it manually."
			);
		}
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
		if (!(await this.isRunning()))
			return new Failure("Syncthing is not running.");
		try {
			const config = await this.syncthingFromREST.getConfiguration();
			return config;
		} catch (error) {
			if (Platform.isMobileApp) {
				console.error(error);
				return new RestFailure();
			}
			const config = await this.syncthingFromCLI.getConfiguration();
			return config;
		}
	}
	async getDevices(): Promise<SyncThingDevice[]> {
		return await this.syncthingFromREST.getDevices();
	}
	async getFolders(): Promise<SyncThingFolder[]> {
		return await this.syncthingFromREST.getAllFolders();
	}
	async startSyncThing(): Promise<boolean> {
		return this.syncthingFromCLI.startSyncThing();
	}
	async stopSyncThing(): Promise<boolean> {
		return this.syncthingFromCLI.stopSyncThing();
	}
}
