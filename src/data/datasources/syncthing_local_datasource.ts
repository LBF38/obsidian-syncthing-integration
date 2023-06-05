import { exec } from "child_process";
import { SyncThingConfigurationModel } from "../../models/syncthing";
import { promisify } from "util";

/**
 * Interface for using the CLI of Syncthing.
 * @see https://docs.syncthing.net/users/syncthing.html#syncthing
 */
export interface SyncThingFromCLI {
	/**
	 * Get the API key of Syncthing installation using the CLI.
	 */
	getAPIkey(): string | Error;
	getConfiguration(): Promise<SyncThingConfigurationModel>;
}

export class SyncThingFromCLIimpl implements SyncThingFromCLI {
	async getConfiguration(): Promise<SyncThingConfigurationModel> {
		const commandToGetConfig = "syncthing cli config dump-json";
		const response = await this.runSyncthingCommand(commandToGetConfig);
		if (response instanceof Error) {
			throw response;
		}
		console.log(JSON.parse(response)["version"]);
		return SyncThingConfigurationModel.fromJSON(response);
	}

	getAPIkey(): string | Error {
		const { stdout, stderr } = exec("syncthing cli config gui apikey get");
		if (stderr) {
			console.error(stderr);
			return "";
		}
		return stdout?.read() ?? Error("No API key found.");
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
