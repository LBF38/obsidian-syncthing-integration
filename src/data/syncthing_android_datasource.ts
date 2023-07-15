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
		const appUrl = `syncthing://${packageName}`;

		const fallbackUrl =
			"https://play.google.com/store/apps/details?id=com.nutomic.syncthingandroid";

		const openApp = () => {
			window.location.href = appUrl;
		};

		const redirectToStore = () => {
			window.location.href = fallbackUrl;
		};

		const checkTimeout = setTimeout(redirectToStore, 2000);

		// Tente d'ouvrir l'application Syncthing
		openApp();

		// Vérifie si l'application Syncthing s'est ouverte
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				console.log("Syncthing is installed");
				clearTimeout(checkTimeout);
			}
		});
		return true; // Experimenting.
	}
}
