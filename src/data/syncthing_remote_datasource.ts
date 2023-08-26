import { Platform, requestUrl } from "obsidian";
import SyncthingPlugin from "src/main";
import {
	SyncthingConfiguration,
	SyncthingDevice,
	SyncthingDeviceStats,
	SyncthingFolder,
	SyncthingFolderStats,
	SyncthingSystemStatus,
	SyncthingVersion,
} from "src/models/entities";
import { RestFailure } from "src/models/failures";
import {
	BaseSchema,
	BaseSchemaAsync,
	Output,
	array,
	boolean,
	literal,
	object,
	safeParseAsync,
} from "valibot";

/**
 * REST API of Syncthing.
 * @see https://docs.syncthing.net/dev/rest.html
 */
export class SyncthingFromREST {
	constructor(public plugin: SyncthingPlugin) {}

	/**
	 * Ping the Syncthing installation using the REST API.
	 * This is used to check if Syncthing is installed.
	 */
	async ping(): Promise<"pong"> {
		return (
			await this.requestEndpoint(
				"/rest/system/ping",
				object({ ping: literal("pong") })
			)
		).ping;
	}

	/**
	 * Get all the folders of Syncthing installation using the REST API.
	 * @see https://docs.syncthing.net/rest/config#rest-config-folders-rest-config-devices
	 */
	async getAllFolders(): Promise<Output<typeof SyncthingFolder>[]> {
		return await this.requestEndpoint(
			"/rest/config/folders",
			array(SyncthingFolder)
		);
	}

	/**
	 * Get all the folders of Syncthing installation for a specific device using the REST API.
	 * @param device - The device to get the folders for.
	 */
	async getFoldersForDevice(
		device: Output<typeof SyncthingDevice>
	): Promise<Output<typeof SyncthingFolder>[]> {
		const folders = await this.getAllFolders();
		return folders.filter((folder) =>
			folder.devices.some(
				(deviceInFolder) => deviceInFolder.deviceID === device.deviceID
			)
		);
	}

	/**
	 * Get all the devices of Syncthing installation using the REST API.
	 * @see https://docs.syncthing.net/rest/config#rest-config-folders-rest-config-devices
	 */
	async getDevices(): Promise<Output<typeof SyncthingDevice>[]> {
		return await this.requestEndpoint(
			"/rest/config/devices",
			array(SyncthingDevice)
		);
	}

	/**
	 * Get the configuration of Syncthing installation using the REST API.
	 * @returns {SyncthingConfiguration} The configuration of Syncthing installation.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	async getConfiguration(): Promise<Output<typeof SyncthingConfiguration>> {
		return await this.requestEndpoint(
			"/rest/config",
			SyncthingConfiguration
		);
	}

	/**
	 * Get the system status of Syncthing installation using the REST API.
	 * It allows to have access to the ID of this device.
	 * @returns the Syncthing system status object.
	 * @see https://docs.syncthing.net/rest/system-status-get.html
	 */
	async getSystemStatus(): Promise<Output<typeof SyncthingSystemStatus>> {
		return await this.requestEndpoint(
			"/rest/system/status",
			SyncthingSystemStatus
		);
	}

	/**
	 * Get the version of Syncthing installation using the REST API.
	 * @returns the Syncthing version object.
	 * @see https://docs.syncthing.net/rest/system-version-get.html
	 */
	async getVersion(): Promise<Output<typeof SyncthingVersion>> {
		return await this.requestEndpoint(
			"/rest/system/version",
			SyncthingVersion
		);
	}

	/**
	 * Get the general statistics about devices. Currently, it only contains the time the device was last seen and the last connection duration.
	 * @returns the Syncthing device statistics object.
	 * @see https://docs.syncthing.net/rest/stats-device-get
	 */
	async getDeviceStatistics() {
		return await this.requestEndpoint(
			"/rest/stats/device/",
			array(SyncthingDeviceStats)
		);
	}

	/**
	 * Get the general statistics about folders. Currently, it only contains the last scan time and the last synced file.
	 * @returns the Syncthing folder statistics object.
	 * @see https://docs.syncthing.net/rest/stats-folder-get
	 */
	async getFolderStatistics() {
		return await this.requestEndpoint(
			"/rest/stats/folder/",
			array(SyncthingFolderStats)
		);
	}

	/**
	 * Check the health of Syncthing instance.
	 * This endpoint does not require authentication.
	 * @returns `true` if the health check is successful, `false` otherwise.
	 * @see https://docs.syncthing.net/rest/noauth-health-get.html
	 */
	async checkHealth(): Promise<boolean> {
		return (
			(
				await this.requestEndpoint(
					"/rest/noauth/health",
					object({ status: literal("OK") })
				)
			).status === "OK"
		);
	}

	/**
	 * Check whether a restart of Syncthing is required for the current config to take effect.
	 * @returns `true` if a restart is required, `false` otherwise.
	 * @see https://docs.syncthing.net/rest/config#rest-config-restart-required
	 */
	async isRestartRequired(): Promise<boolean> {
		return (
			await this.requestEndpoint(
				"/rest/config/restart-required",
				object({
					requiresRestart: boolean(),
				})
			)
		).requiresRestart;
	}

	/**
	 * Private method to request an endpoint of the REST API.
	 * The endpoint should start with a `/`.
	 *
	 * @param endpoint - The REST endpoint to call. @see https://docs.syncthing.net/dev/rest.html
	 * @returns The response of the REST API.
	 */
	private async requestEndpoint<TSchema extends BaseSchema | BaseSchemaAsync>(
		endpoint: string,
		schema: TSchema
	): Promise<Output<TSchema>> {
		// FIXME: Fix the issue when connecting to the REST API. (error 403)
		console.log("requestEndpoint: Endpoint", endpoint);
		let ip_address = this.plugin.settings.url?.ip_address;
		if (ip_address === "localhost" && Platform.isMobileApp)
			ip_address = "127.0.0.1";
		const url = `${this.plugin.settings.url?.protocol}://${ip_address}:${this.plugin.settings.url?.port}${endpoint}`;
		const response = requestUrl({
			url: url,
			method: "GET",
			headers: {
				"X-API-Key": this.plugin.settings.api_key,
				Accept: "*/*",
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				redirect: "follow",
			},
		});
		console.log(
			"requestEndpoint: API Key set ?",
			this.plugin.settings.api_key !== ""
		);
		console.log("requestEndpoint: url requested ", url);
		const result = await safeParseAsync(schema, await response.json);
		if (!result.success) {
			console.error(
				"requestEndpoint ERROR: ",
				`endpoint: ${endpoint}`,
				result.issues
			);
			throw new RestFailure(
				result.issues.map((issue) => issue.message).join("\n")
			);
			// TODO: ^ refactor to neverthrow.
		}
		return result.output;
	}
}
