import { SyncthingConfigurationModel } from "../models/models";
import { CliFailure } from "src/models/failures";
import { Platform } from "obsidian";

/**
 * CLI of Syncthing.
 * @see https://docs.syncthing.net/users/syncthing.html#syncthing
 */
export class SyncthingFromCLI {
	/**
	 * Stop the Syncthing service using the CLI.
	 */
	async stopSyncthing(): Promise<boolean> {
		const syncthingStop = "syncthing cli operations shutdown";
		const response = this.runSyncthingCommand(syncthingStop);
		if (response instanceof Error) {
			throw new CliFailure(response.message);
		}
		return true;
	}

	/**
	 * Start the Syncthing service using the CLI.
	 */
	async startSyncthing(): Promise<boolean> {
		const syncthingStart = "syncthing";
		const response = await this.runSyncthingCommand(syncthingStart);
		if (response instanceof Error) {
			throw new CliFailure(response.message);
		}
		return true;
	}

	/**
	 * Get the version of Syncthing installation using the CLI.
	 * This is used to check if Syncthing is installed.
	 */
	async getVersion(): Promise<string> {
		const syncthingVersion = "syncthing --version";
		const response = await this.runSyncthingCommand(syncthingVersion);
		if (response instanceof Error) {
			throw new CliFailure(response.message);
		}
		return response;
	}

	/**
	 * Get the configuration of Syncthing installation using the CLI.
	 */
	async getConfiguration(): Promise<SyncthingConfigurationModel> {
		const commandToGetConfig = "syncthing cli config dump-json";
		const response = await this.runSyncthingCommand(commandToGetConfig);
		if (response instanceof Error) {
			throw new CliFailure(response.message);
		}
		return SyncthingConfigurationModel.fromJSON(response);
	}

	/**
	 * Get the API key of Syncthing installation using the CLI.
	 */
	async getAPIkey(): Promise<string> {
		const response = await this.runSyncthingCommand(
			"syncthing cli config gui apikey get"
		);
		if (response instanceof Error) {
			throw new CliFailure("No API key found.");
		}
		return response.trim();
	}

	private async runSyncthingCommand(
		command: string
	): Promise<string | Error> {
		if (Platform.isMobileApp) {
			return Error("CLI not supported on mobile.");
		}
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { promisify } = require("util");
		// MacOS - try the syncthing-macos application package first, 
		// otherwise we'll fall back to the regular path traversal search
		if (Platform.isMacOS && command.startsWith("syncthing")) {
			// application folder for syncthing-macos install
			const APP_REF = "/Applications/Syncthing.app/Contents/Resources/syncthing/";
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { stat } = require("fs");
			const statPromise = promisify(stat);
			const stats = await statPromise(APP_REF);
			if (stats.isDirectory()) {
				command = APP_REF + command;
			}
		}
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { exec } = require("child_process");
		const execPromise = promisify(exec);
		const result = await execPromise(command);
		if (result.stderr) {
			return Error(result.stderr);
		}
		return result.stdout;
	}
}
