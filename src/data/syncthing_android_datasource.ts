import { Platform } from "obsidian";

/**
 * Android controller for Syncthing on Android.
 * @see https://github.com/syncthing/syncthing-android
 */
export class SyncthingFromAndroid {
	/**
	 * Check if the Syncthing Android app is installed.
	 */
	async hasSyncthing(): Promise<boolean> {
		// TODO: refactor OR delete.
		// const { value } = await AppLauncher.canOpenUrl({
		// 	url: "com.nutomic.syncthingandroid",
		// });
		// return value;
		console.log("Platform: ", Platform);
		console.log("Obsidian App: ", app);
		return true;
	}

	/**
	 * Open the Syncthing Android app.
	 */
	async openSyncthing(): Promise<boolean> {
		// TODO: refactor w/ better solution.
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
