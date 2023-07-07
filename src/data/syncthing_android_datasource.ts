import { AppLauncher } from "@capacitor/app-launcher";

/**
 * Interface for using the Syncthing App on Android.
 * @see https://github.com/syncthing/syncthing-android
 */
export interface SyncthingFromAndroid {
	// /**
	//  * Get the configuration of Syncthing installation using the CLI.
	//  */
	// getConfiguration(): Promise<SyncThingConfigurationModel>;
	/**
	 * Check if the Syncthing Android app is installed.
	 */
	hasSyncthing(): Promise<boolean>;
	/**
	 * Open the Syncthing Android app.
	 */
	openSyncthing(): Promise<boolean>;

	// /**
	//  * Start the Syncthing service using the CLI.
	//  */
	// startSyncThing(): Promise<boolean>;
	// /**
	//  * Stop the Syncthing service using the CLI.
	//  */
	// stopSyncThing(): Promise<boolean>;
}

export class SyncthingFromAndroidImpl implements SyncthingFromAndroid {
	async hasSyncthing(): Promise<boolean> {
		const { value } = await AppLauncher.canOpenUrl({
			url: "com.nutomic.syncthingandroid",
		});
		return value;
	}
	async openSyncthing(): Promise<boolean> {
		if (await this.hasSyncthing()) {
			await AppLauncher.openUrl({ url: "com.nutomic.syncthingandroid" });
			return true;
		}
		return false;
	}
}
