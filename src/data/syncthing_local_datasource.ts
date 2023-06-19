import { exec } from "child_process";
import { SyncThingConfigurationModel } from "../models/models";
import { promisify } from "util";
import { CliFailure } from "src/models/failures";

/**
 * Interface for using the CLI of Syncthing.
 * @see https://docs.syncthing.net/users/syncthing.html#syncthing
 */
export interface SyncThingFromCLI {
	/**
	 * Get the API key of Syncthing installation using the CLI.
	 */
	getAPIkey(): Promise<string>;
	/**
	 * Get the configuration of Syncthing installation using the CLI.
	 */
	getConfiguration(): Promise<SyncThingConfigurationModel>;
	/**
	 * Get the version of Syncthing installation using the CLI.
	 * This is used to check if Syncthing is installed.
	 */
	getVersion(): Promise<string>;
	/**
	 * Start the Syncthing service using the CLI.
	 */
	startSyncThing(): Promise<boolean>;
	/**
	 * Stop the Syncthing service using the CLI.
	 */
	stopSyncThing(): Promise<boolean>;
}

export class SyncThingFromCLIimpl implements SyncThingFromCLI {
	async stopSyncThing(): Promise<boolean> {
		const syncthingStop = "syncthing cli operations shutdown";
		const response = this.runSyncthingCommand(syncthingStop);
		if (response instanceof Error) {
			throw new CliFailure(response.message);
		}
		return true;
	}

	async startSyncThing(): Promise<boolean> {
		const syncthingStart = "syncthing";
		const response = await this.runSyncthingCommand(syncthingStart);
		if (response instanceof Error) {
			throw new CliFailure(response.message);
		}
		return true;
	}

	async getVersion(): Promise<string> {
		const syncthingVersion = "syncthing --version";
		const response = await this.runSyncthingCommand(syncthingVersion);
		if (response instanceof Error) {
			throw new CliFailure(response.message);
		}
		return response;
	}

	async getConfiguration(): Promise<SyncThingConfigurationModel> {
		const commandToGetConfig = "syncthing cli config dump-json";
		const response = await this.runSyncthingCommand(commandToGetConfig);
		if (response instanceof Error) {
			throw new CliFailure(response.message);
		}
		console.log("Config version : " + JSON.parse(response)["version"]);
		return SyncThingConfigurationModel.fromJSON(response);
	}

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
		const execPromise = promisify(exec);
		const result = await execPromise(command);
		if (result.stderr) {
			return Error(result.stderr);
		}
		return result.stdout;
	}
}
