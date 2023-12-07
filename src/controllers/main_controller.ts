import { Platform, TFile } from "obsidian";
import { type SyncthingFromAndroid } from "src/data/syncthing_android_datasource";
import { SyncthingFromCLI } from "src/data/syncthing_local_datasource";
import { SyncthingFromREST } from "src/data/syncthing_remote_datasource";
import SyncthingPlugin from "src/main";
import {
	SyncthingConfiguration,
	SyncthingDevice,
	SyncthingFolder,
	type ConflictFilename,
} from "src/models/entities";
import { CliFailure, Failure, RestFailure } from "src/models/failures";
import { isConflictFilename, parseConflictFilename, sortByConflictDate } from "./utils";

/**
 * Main controller of the plugin.
 * Allows to easily connect with Syncthing.
 */
export class SyncthingController {
	constructor(
		/**
		 * CLI datasource to Syncthing
		 */
		public syncthingFromCLI: SyncthingFromCLI,
		/**
		 * REST datasource to Syncthing
		 */
		public syncthingFromREST: SyncthingFromREST,
		/**
		 * Android datasource to Syncthing
		 */
		public syncthingFromAndroid: SyncthingFromAndroid,
		/**
		 * The plugin instance.
		 * To make it easier to call plugin's methods.
		 * @see https://docs.obsidian.md/Reference/TypeScript+API/Plugin/Plugin
		 */
		public plugin: SyncthingPlugin
	) { }

	/**
	 * Checks if Syncthing is running.
	 */
	async isRunning(): Promise<boolean> {
		console.log("isRunning");
		return this.syncthingFromREST
			.ping()
			.then((response) => {
				console.log(response);
				return true;
			})
			.catch((error) => {
				console.log(error);
				return false;
			});
	}

	/**
	 * Gets the Syncthing CLI status.
	 */
	getCLIStatus(): Promise<string> {
		return this.syncthingFromCLI.getVersion();
	}

	/**
	 * Gets the Syncthing API status.
	 */
	async getAPIStatus(): Promise<string> {
		if (!this.plugin.settings.api_key) {
			return "API key is not set.";
		}
		return this.syncthingFromREST.ping();
	}

	/**
	 * Checks if Syncthing is installed on the system.
	 */
	async hasSyncthing(): Promise<boolean> {
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

	async getConflictsWithOriginal(activeFile: TFile): Promise<{ originalFile?: TFile, conflicts: TFile[] }> {
		const allFiles = this.plugin.app.vault.getFiles();
		if (isConflictFilename(activeFile.basename)) {
			const properties = parseConflictFilename(activeFile.basename);
			if (properties instanceof Failure) {
				console.error(properties.message);
				throw new Error("Error parsing conflict filename.");
			}
			const conflictFiles = allFiles.filter((file) => {
				return (
					(file.name.contains(".sync-conflict") &&
						file.name.contains(properties.filename)) ||
					file.basename === properties.filename
				);
			});
			const originalFile = allFiles.find((file) => file.basename === properties.filename);
			if (originalFile) conflictFiles.remove(originalFile);
			return {
				originalFile: originalFile,
				conflicts: conflictFiles,
			};
		}
		const conflicts = allFiles.filter((file) => {
			return (
				file.name.contains(".sync-conflict") &&
				file.name.contains(activeFile.basename)
			);
		});
		return {
			conflicts: conflicts,
		};
	}


	/**
	 * Gets the Syncthing conflicting files for the ConflictsModal.
	 * It returns a list of all files that are in conflict.
	 * (but only one version of each file, if applicable)
	 * @see https://docs.syncthing.net/users/syncing.html#conflicting-changes
	 */
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
			const filenameProperties = parseConflictFilename(file.name);
			if (filenameProperties instanceof Failure) {
				return filenameProperties;
			}
			const filename = filenameProperties.filename;
			if (conflictsFilesMap.has(filename)) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				conflictsFilesMap.get(filename)!.push(file);
				conflictsFilesMap.set(
					filename,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					conflictsFilesMap
						.get(filename)!
						.sort((a, b) => sortByConflictDate(a, b))
				);
				continue;
			}
			conflictsFilesMap.set(filename, [file]);
		}
		return conflictsFilesMap;
	}

	/**
	 * Gets the Syncthing conflicting files for the DiffModal.
	 * @see https://docs.syncthing.net/users/syncing.html#conflicting-changes
	 */
	async getDiffFiles(file: TFile): Promise<{
		originalFile: TFile;
		conflictingFiles: TFile[] | Failure;
		conflictingFilesProperties: Map<TFile, ConflictFilename | Failure>;
	}> {
		const filenameProperties = parseConflictFilename(file.name);
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
			const properties = parseConflictFilename(conflictingFile.name);
			conflictingFilesProperties.set(conflictingFile, properties);
		}
		return {
			originalFile: originalFile ? originalFile : file,
			conflictingFiles: conflictsFiles,
			conflictingFilesProperties: conflictingFilesProperties,
		};
	}

	/**
	 * Gets the Syncthing API key from the CLI.
	 */
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

	/**
	 * Gets the Syncthing configuration.
	 */
	async getConfiguration(): Promise<SyncthingConfiguration | Failure> {
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

	/**
	 * Gets the Syncthing devices.
	 */
	async getDevices(): Promise<SyncthingDevice[]> {
		return await this.syncthingFromREST.getDevices();
	}

	/**
	 * Gets the Syncthing folders.
	 */
	async getFolders(): Promise<SyncthingFolder[]> {
		return await this.syncthingFromREST.getAllFolders();
	}

	/**
	 * Starts the Syncthing service.
	 */
	async startSyncthing(): Promise<boolean> {
		return this.syncthingFromCLI.startSyncthing();
	}

	/**
	 * Stops the Syncthing service.
	 */
	async stopSyncthing(): Promise<boolean> {
		return this.syncthingFromCLI.stopSyncthing();
	}
}
