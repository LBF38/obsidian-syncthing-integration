import { exec } from "child_process";

/**
 * Interface for using the CLI of Syncthing.
 * @see https://docs.syncthing.net/users/syncthing.html#syncthing
 */
export interface SyncThingFromCLI {
	/**
	 * Get the API key of Syncthing installation using the CLI.
	 */
	getAPIkey(): string | Error;
}

export class SyncThingFromCLIimpl implements SyncThingFromCLI {
	getAPIkey(): string | Error {
		const { stdout, stderr } = exec("syncthing cli config gui apikey get");
		if (stderr) {
			console.error(stderr);
			return "";
		}
		return stdout?.read() ?? Error("No API key found.");
	}
}
