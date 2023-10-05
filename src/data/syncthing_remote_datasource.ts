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

	//! System Endpoint
	//? https://docs.syncthing.net/dev/rest.html#system-endpoint

	private async system_browse(current?: string) {}
	private async system_connections() {}
	private async system_discovery() {}
	private async system_debug() {}
	private async system_clearErrors() {}
	private async system_error() {}
	private async system_log() {}
	private async system_paths() {}
	private async system_pause() {}
	private async system_ping() {}
	private async system_reset() {}
	private async system_restart() {}
	private async system_resume() {}
	private async system_shutdown() {}
	private async system_status() {}
	private async system_upgrade() {}
	private async system_version() {}

	//! Config Endpoint
	//? https://docs.syncthing.net/dev/rest.html#config-endpoint

	private async config_all() {}
	private async config_folders(id?: string) {}
	private async config_devices(
		id?: string,
		method: "GET" | "PUT" | "PATCH" | "DELETE" = "GET"
	) {
		return await this.requestEndpoint(
			"/rest/config/devices",
			array(SyncthingDevice)
		);
	}
	private async config_restart_required() {}
	private async config_defaults_folder() {}
	private async config_defaults_device() {}
	private async config_defaults_ignores() {}
	private async config_options() {}
	private async config_ldap() {}
	private async config_gui() {}

	//! Cluster Endpoint
	//? https://docs.syncthing.net/dev/rest.html#discovery-endpoint

	//TODO: implement all endpoints
	private async cluster_devices() {}
	private async cluster_folders() {}

	//! Folder Endpoint
	//? https://docs.syncthing.net/dev/rest.html#folder-endpoint

	//TODO: implement all endpoints
	private async folder_errors() {}
	private async folder_versions() {}

	//! Database Endpoint
	//? https://docs.syncthing.net/dev/rest.html#database-endpoint

	//TODO: implement all endpoints
	private async db_browse() {}
	private async db_completion() {}
	private async db_file() {}
	private async db_ignores() {}
	private async db_localchanged() {}
	private async db_need() {}
	private async db_override() {}
	private async db_prio() {}
	private async db_remoteneed() {}
	private async db_revert() {}
	private async db_scan() {}
	private async db_status() {}

	//! Event Endpoint

	private async events() {}
	private async disk() {}

	//! Statistics Endpoint
	//? https://docs.syncthing.net/dev/rest.html#statistics-endpoint

	private async stats_device() {}
	private async stats_folder() {}

	//! Misc Endpoint
	//? https://docs.syncthing.net/dev/rest.html#misc-endpoint

	private async svc_deviceid() {}
	private async svc_lang() {}
	private async svc_random_string() {}
	private async svc_report() {}

	//! Debug Endpoint
	//? https://docs.syncthing.net/dev/rest.html#debug-endpoint

	//TODO: implement all endpoints
	private async debug_block() {}

	//! Noauth Endpoint
	//? https://docs.syncthing.net/dev/rest.html#noauth-endpoint

	private async noauth_health() {
		return (
			(
				await this.requestEndpoint(
					"/rest/noauth/health",
					object({ status: literal("OK") })
				)
			).status === "OK"
		);
	}

	// Formatting the endpoints in objects.

	system = {
		browse: this.system_browse,
		connections: this.system_connections,
		debug: this.system_debug,
		discovery: this.system_discovery,
		clearErrors: this.system_clearErrors,
		error: this.system_error,
		log: this.system_log,
		paths: this.system_paths,
		pause: this.system_pause,
		ping: this.system_ping,
		reset: this.system_reset,
		restart: this.system_restart,
		resume: this.system_resume,
		shutdown: this.system_shutdown,
		status: this.system_status,
		upgrade: this.system_upgrade,
		version: this.system_version,
	};

	config = {
		all: this.config_all,
		devices: this.config_devices,
		folders: this.config_folders,
		restart_required: this.config_restart_required,
		defaults: {
			folder: this.config_defaults_folder,
			device: this.config_defaults_device,
			ignores: this.config_defaults_ignores,
		},
		options: this.config_options,
		ldap: this.config_ldap,
		gui: this.config_gui,
	};

	cluster = {
		devices: this.cluster_devices,
		folders: this.cluster_folders,
	};

	folder = { errors: this.folder_errors, versions: this.folder_versions };

	db = {
		browse: this.db_browse,
		completion: this.db_completion,
		file: this.db_file,
		ignores: this.db_ignores,
		localchanged: this.db_localchanged,
		need: this.db_need,
		override: this.db_override,
		prio: this.db_prio,
		remoteneed: this.db_remoteneed,
		revert: this.db_revert,
		scan: this.db_scan,
		status: this.db_status,
	};

	event = {
		events: this.events,
		disk: this.disk,
	};

	stats = {
		device: this.stats_device,
		folder: this.stats_folder,
	};

	svc = {
		deviceid: this.svc_deviceid,
		lang: this.svc_lang,
		random_string: this.svc_random_string,
		report: this.svc_report,
	};

	debug = {
		// block: this.debug_block,
	};

	noauth = {
		health: this.noauth_health,
	};

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
	 * Restart Syncthing.
	 * @see https://docs.syncthing.net/rest/system-restart-post.html
	 */
	async restart(): Promise<void> {
		await this.requestEndpoint("/rest/system/restart", object({}), "POST");
	}

	//! Utils
	// Request Endpoint

	/**
	 * Private method to request an endpoint of the REST API.
	 * The endpoint should start with a `/`.
	 *
	 * @param endpoint - The REST endpoint to call. @see https://docs.syncthing.net/dev/rest.html
	 * @returns The response of the REST API.
	 */
	private async requestEndpoint<TSchema extends BaseSchema | BaseSchemaAsync>(
		endpoint: string,
		schema: TSchema,
		method: "GET" | "POST" | "PUT" | "PATCH" = "GET"
	): Promise<Output<TSchema>> {
		// FIXME: Fix the issue when connecting to the REST API. (error 403)
		console.log("requestEndpoint: Endpoint", endpoint);
		let ip_address = this.plugin.settings.url?.ip_address;
		if (ip_address === "localhost" && Platform.isMobileApp)
			ip_address = "127.0.0.1";
		const url = `${this.plugin.settings.url?.protocol}://${ip_address}:${this.plugin.settings.url?.port}${endpoint}`;
		const response = requestUrl({
			url: url,
			method: method,
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
