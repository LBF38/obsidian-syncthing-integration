import { Platform } from "obsidian";

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
		// const { value } = await AppLauncher.canOpenUrl({
		// 	url: "com.nutomic.syncthingandroid",
		// });
		// return value;
		console.log("Platform: ", Platform);
		console.log("Obsidian App: ", app);
		return true;
	}
	async openSyncthing(): Promise<boolean> {
		const packageName = "com.nutomic.syncthingandroid";
		const intentAction = "android.intent.action.MAIN";
		const intentCategory = "android.intent.category.LAUNCHER";

		const deepLink = `intent://${intentAction}#${intentCategory};package=${packageName};end`;
		const deepLink2 = `intent://${packageName}/${intentAction}#${intentCategory};end`;

		// Ouvrir le lien profond dans le navigateur du système
		const syncthingApp = window.open(deepLink);
		console.log("Syncthing App: ", syncthingApp);
		syncthingApp?.open(deepLink2);
		return syncthingApp != null;
	}
}
