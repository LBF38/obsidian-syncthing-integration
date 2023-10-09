import { Platform, requestUrl } from "obsidian";
import { dateSchema } from "src/controllers/utils";
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
	SyncthingEventTypes,
	UnionSyncthingEvents,
} from "src/models/syncthing_events";
import {
	BaseSchema,
	BaseSchemaAsync,
	Output,
	any,
	array,
	boolean,
	keyof,
	literal,
	merge,
	nullable,
	number,
	object,
	record,
	safeParseAsync,
	string,
	union,
	voidType,
} from "valibot";

/**
 * REST API of Syncthing.
 * @see https://docs.syncthing.net/dev/rest.html
 */
export class SyncthingFromREST {
	constructor(public plugin: SyncthingPlugin) {}

	//! System Endpoint
	//? https://docs.syncthing.net/dev/rest.html#system-endpoint

	/**
	 * @see https://docs.syncthing.net/rest/system-browse-get.html
	 */
	private async system_browse(current?: string) {
		return await this.requestEndpoint(
			`/rest/system/browse?current=${current}`,
			array(string())
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/system-connections-get.html
	 */
	private async system_connections() {
		const connectionsTypeSchema = union(
			[
				literal("TCP (Client)"),
				literal("TCP (Server)"),
				literal("Relay (Client)"),
				literal("Relay (Server)"),
			],
			"Error parsing connections type"
		);
		const primarySchema = object({
			at: dateSchema,
			inBytesTotal: number(),
			outBytesTotal: number(),
			startedAt: dateSchema,
			address: string(),
			type: nullable(connectionsTypeSchema),
			isLocal: boolean(),
			crypto: string(),
		});
		const connectionsSchema = object({
			connections: record(
				merge([
					primarySchema,
					object({
						connected: boolean(),
						paused: boolean(),
						clientVersion: string(),
						primary: primarySchema,
					}),
				])
			),
			total: object({
				at: dateSchema,
				inBytesTotal: number(),
				outBytesTotal: number(),
			}),
		});
		return await this.requestEndpoint(
			"/rest/system/connections",
			connectionsSchema
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/system-discovery-get.html
	 */
	private async system_discovery() {
		return await this.requestEndpoint(
			"/rest/system/discovery",
			nullable(record(array(string())))
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/system-debug-get.html
	 * @see https://docs.syncthing.net/rest/system-debug-post.html
	 */
	private async system_debug(
		method: "GET" | "POST" = "GET",
		// TODO: export the facilities type.
		// disable?: keyof typeof facilitiesSchema,
		// enable?: keyof typeof facilitiesSchema
		disable?: string[],
		enable?: string[]
	) {
		// TODO: export the type and simplify it.
		const facilitiesSchema = object({
			api: literal("REST API"),
			app: literal("Main run facility"),
			backend: literal("The database backend"),
			beacon: literal("Multicast and broadcast discovery"),
			config: literal("Configuration loading and saving"),
			connections: literal("Connection handling"),
			db: literal("The database layer"),
			dialer: literal("Dialing connections"),
			discover: literal("Remote device discovery"),
			events: literal("Event generation and logging"),
			fs: literal("Filesystem access"),
			main: literal("Main package"),
			model: literal("The root hub"),
			nat: literal("NAT discovery and port mapping"),
			pmp: literal("NAT-PMP discovery and port mapping"),
			protocol: literal("The BEP protocol"),
			relay: string(),
			scanner: literal("File change detection and hashing"),
			sha256: literal("SHA256 hashing package"),
			stats: literal("Persistent device and folder statistics"),
			stun: literal("STUN functionality"),
			sync: literal("Mutexes"),
			upgrade: literal("Binary upgrades"),
			upnp: literal("UPnP discovery and port mapping"),
			ur: literal("Usage reporting"),
			versioner: literal("File versioning"),
			walkfs: literal("Filesystem access while walking"),
			watchaggregator: literal("Filesystem event watcher"),
		});
		if (method == "GET") {
			return await this.requestEndpoint(
				"/rest/system/debug",
				object({
					enabled: nullable(array(keyof(facilitiesSchema))),
					facilities: facilitiesSchema,
				})
			);
		}
		if (method == "POST") {
			return await this.requestEndpoint(
				`/rest/system/debug?disable=${disable?.join(
					","
				)}&enable=${enable?.join(",")}`,
				voidType(),
				method
			);
		}
	}

	/**
	 * @see https://docs.syncthing.net/rest/system-error-clear-post.html
	 */
	private async system_clearErrors() {
		return await this.requestEndpoint(
			"/rest/system/error/clear",
			voidType(),
			"POST"
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/system-error-get.html
	 * @see https://docs.syncthing.net/rest/system-error-post.html
	 */
	private async system_error(
		method: "GET" | "POST" = "GET",
		message?: string
	) {
		if (method == "GET") {
			return await this.requestEndpoint(
				"/rest/system/error",
				object({
					errors: nullable(
						array(
							object({
								when: dateSchema,
								message: string(),
							})
						)
					),
				})
			);
		}
		if (method == "POST" && message) {
			// TODO implement
			return await this.requestEndpoint(
				"/rest/system/error",
				voidType(),
				"POST",
				message,
				"text/plain"
				// TODO: verify
			);
		}
	}

	/**
	 * @see https://docs.syncthing.net/rest/system-log-get.html
	 */
	private async system_log(json = true) {
		const logSchema = object({
			messages: array(
				object({
					message: string(),
					when: dateSchema,
					level: number(),
				})
			),
		});
		return await this.requestEndpoint(
			`/rest/system/log${json ? "" : ".txt"}`,
			json ? logSchema : string()
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/system-paths-get.html
	 */
	private async system_paths() {
		return await this.requestEndpoint(
			"/rest/system/paths",
			object({
				auditLog: string(),
				"baseDir-config": string(),
				"baseDir-data": string(),
				"baseDir-userHome": string(),
				certFile: string(),
				config: string(),
				csrfTokens: string(),
				database: string(),
				defFolder: string(),
				guiAssets: string(),
				httpsCertFile: string(),
				httpsKeyFile: string(),
				keyFile: string(),
				logFile: string(),
				panicLog: string(),
			})
		);
	}

	/**
	 * Pause the given device or all devices.
	 *
	 * Takes the optional parameter ``device`` (device ID). When omitted, pauses all devices.
	 *
	 * Returns status 200 and no content upon success, or status 500 and a plain text error on failure.
	 * @see https://docs.syncthing.net/rest/system-pause-post.html
	 */
	private async system_pause(deviceID?: string) {
		return await this.requestEndpoint(
			`/rest/system/pause?device=${deviceID}`,
			voidType()
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/system-ping-get.html
	 * @see https://docs.syncthing.net/rest/system-ping-post.html
	 */
	private async system_ping(method: "GET" | "POST" = "GET") {
		return (
			await this.requestEndpoint(
				"/rest/system/ping",
				object({ ping: literal("pong") }),
				method
			)
		).ping;
	}

	/**
	 * Post with empty body to erase the current index database and restart Syncthing. With no query parameters, the entire database is erased from disk.
	 *
	 * By specifying the ``folder`` parameter with a valid folder ID, only information for that folder will be erased:
	 * ```
	 * curl -X POST -H "X-API-Key: abc123" http://localhost:8384/rest/system/reset?folder=ab1c2-def3g

	 * ```
	 * **Caution**: See `--reset-database` for ``.stfolder`` creation side-effect and caution regarding mountpoints.
	 *
	 * @see https://docs.syncthing.net/rest/system-reset-post.html
	 */
	private async system_reset(folderID?: string) {
		// TODO: test this endpoint in a new Syncthing configuration OR inside a Docker in a Docker.
		return await this.requestEndpoint(
			`/rest/system/reset?folder=${folderID}`,
			voidType(),
			"POST"
		);
	}

	/**
	 * Post with empty body to immediately restart Syncthing.
	 *
	 * @see https://docs.syncthing.net/rest/system-restart-post.html
	 */
	private async system_restart() {
		return await this.requestEndpoint(
			"/rest/system/restart",
			voidType(),
			"POST"
		);
	}

	/**
	 * Resume the given device or all devices.
	 *
	 * Takes the optional parameter ``device`` (device ID). When omitted, resumes all devices.
	 * Returns status 200 and no content upon success, or status 500 and a plain text error on failure.
	 *
	 * @see https://docs.syncthing.net/rest/system-resume-post.html
	 */
	private async system_resume(deviceID?: string) {
		return await this.requestEndpoint(
			`/rest/system/resume?device=${deviceID}`,
			voidType()
		);
	}

	/**
	 * Post with empty body to cause Syncthing to exit and not restart.
	 *
	 * @see https://docs.syncthing.net/rest/system-shutdown-post.html
	 */
	private async system_shutdown() {
		return await this.requestEndpoint(
			"/rest/system/shutdown",
			voidType(),
			"POST"
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/system-status-get.html
	 */
	private async system_status() {
		return await this.requestEndpoint(
			"/rest/system/status",
			SyncthingSystemStatus
		);
	}

	/**
	 * GET /rest/system/upgrade
	 *
	 * Checks for a possible upgrade and returns an object describing the newest version and upgrade possibility.
	 *
	 * @example
	 * ```
	 * {
	 *   "latest": "v0.14.47",
	 *   "majorNewer": false,
	 *   "newer": true,
	 *   "running": "v0.14.46"
	 * }
	 * ```
	 *
	 * @see https://docs.syncthing.net/rest/system-upgrade-get.html
	 *
	 *
	 * POST /rest/system/upgrade
	 *
	 * Perform an upgrade to the newest released version and restart.
	 * Does nothing if there is no newer version than currently running.
	 *
	 * @see https://docs.syncthing.net/rest/system-upgrade-post.html
	 */
	private async system_upgrade(method: "GET" | "POST" = "GET") {
		if (method == "GET") {
			return await this.requestEndpoint(
				"/rest/system/upgrade",
				object({
					latest: string(),
					majorNewer: boolean(),
					newer: boolean(),
					running: string(),
				})
			);
		}
		return await this.requestEndpoint(
			"/rest/system/upgrade",
			voidType(),
			"POST"
		);
	}

	/**
	 * Returns the current Syncthing version information.
	 * @see https://docs.syncthing.net/rest/system-version-get.html
	 */
	private async system_version() {
		return await this.requestEndpoint(
			"/rest/system/version",
			object({
				arch: string(),
				codename: string(),
				container: boolean(),
				date: dateSchema,
				extra: string(),
				isBeta: boolean(),
				isCandidate: boolean(),
				isRelease: boolean(),
				longVersion: string(),
				os: string(),
				stamp: string(),
				tags: array(string()),
				user: string(),
				version: string(),
			})
		);
	}

	//! Config Endpoint
	//? https://docs.syncthing.net/dev/rest.html#config-endpoint

	/**
	 * ``GET`` returns the entire config and ``PUT`` replaces it.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_all(
		method: "GET" | "PUT" = "GET",
		config?: Output<typeof SyncthingConfiguration>
	) {
		return await this.requestEndpoint(
			"/rest/config",
			SyncthingConfiguration,
			method,
			method == "PUT" ? JSON.stringify(config) : ""
		);
	}

	/**
	 * /rest/config/folders, /rest/config/devices
	 *
	 * ``GET`` returns all folders respectively devices as an array.
	 * ``PUT`` takes an array and ``POST`` a single object.
	 * In both cases if a given folder/device already exists, it's replaced, otherwise a new one is added.
	 *
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_folders(id?: string) {
		// TODO: implement same as config_devices.
	}

	/**
	 * /rest/config/folders, /rest/config/devices
	 * ``GET`` returns all folders respectively devices as an array.
	 * ``PUT`` takes an array and ``POST`` a single object.
	 * In both cases if a given folder/device already exists, it's replaced, otherwise a new one is added.
	 *
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_devices(
		id?: string,
		method: "GET" | "PUT" | "POST" | "PATCH" | "DELETE" = "GET",
		device?: Output<typeof SyncthingDevice>
	) {
		if (id) {
			return await this.requestEndpoint(
				`/rest/config/devices/${id}`,
				method == "GET" ? SyncthingDevice : voidType(),
				method,
				method == "PUT" || method == "PATCH"
					? JSON.stringify(device)
					: ""
			);
		}
		if (method == "DELETE" || method == "PATCH") return;
		// TODO: add validation of the body input for PUT and POST.
		return await this.requestEndpoint(
			"/rest/config/devices",
			method == "GET" ? array(SyncthingDevice) : voidType()
		);
	}

	/**
	 * ``GET`` returns whether a restart of Syncthing is required for the current config to take effect.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_restart_required() {
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
	 * `GET` returns a template folder / device configuration object with all default values, which only needs a unique ID to be applied.
	 *
	 * `PUT` replaces the default config (omitted values are reset to the hard-coded defaults), `PATCH` replaces only the given child objects.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_defaults_folder(
		method: "GET" | "PUT" | "PATCH" = "GET"
	) {
		return await this.requestEndpoint(
			"/rest/config/defaults/folder",
			SyncthingFolder,
			method
		);
	}

	/**
	 * `GET` returns a template folder / device configuration object with all default values, which only needs a unique ID to be applied.
	 *
	 * `PUT` replaces the default config (omitted values are reset to the hard-coded defaults), `PATCH` replaces only the given child objects.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_defaults_device(
		method: "GET" | "PUT" | "PATCH" = "GET"
	) {
		return await this.requestEndpoint(
			"/rest/config/defaults/device",
			SyncthingDevice,
			method
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_defaults_ignores(
		method: "GET" | "PUT" = "GET",
		linesToIgnore: { lines: string[] } // TODO refactor
	) {
		const ignoresLineSchema = object({
			lines: array(string()),
		});
		return await this.requestEndpoint(
			"/rest/config/defaults/ignores",
			method == "GET" ? ignoresLineSchema : voidType(),
			method,
			method == "PUT" ? JSON.stringify(linesToIgnore) : ""
		);
	}

	/**
	 * `GET` returns the respective object, `PUT` replaces the entire object and `PATCH` replaces only the given child objects.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_options() {
		// TODO: implement & verify
	}

	/**
	 * `GET` returns the respective object, `PUT` replaces the entire object and `PATCH` replaces only the given child objects.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_ldap(method: "GET" | "PUT" | "PATCH" = "GET") {
		// TODO: implement & verify
		return await this.requestEndpoint(
			"/rest/config/ldap",
			object({
				address: string(),
				bindDN: string(),
				transport: string(),
				insecureSkipVerify: boolean(),
				searchBaseDN: string(),
				searchFilter: string(),
			}),
			method
		);
	}

	/**
	 * `GET` returns the respective object, `PUT` replaces the entire object and `PATCH` replaces only the given child objects.
	 * @see https://docs.syncthing.net/rest/config.html
	 */
	private async config_gui() {
		// TODO: implement & verify
	}

	//! Cluster Endpoint
	//? https://docs.syncthing.net/dev/rest.html#discovery-endpoint

	/**
	 * GET /rest/cluster/pending/devices
	 * @see https://docs.syncthing.net/rest/cluster-pending-devices-get.html
	 *
	 * @since Syncthing 1.13.0
	 *
	 * Lists remote devices which have tried to connect, but are not yet
	 * configured in our instance.
	 *
	 * @example
	 * ```json
	 *     {
	 *       "P56IOI7-MZJNU2Y-IQGDREY-DM2MGTI-MGL3BXN-PQ6W5BM-TBBZ4TJ-XZWICQ2": {
	 *         "time": "2020-03-18T11:43:07Z",
	 *         "name": "Friend Joe",
	 *         "address": "192.168.1.2:22000"
	 *       }
	 *     }
	 * ```
	 *
	 * ***
	 *
	 * DELETE /rest/cluster/pending/devices
	 * @see https://docs.syncthing.net/rest/cluster-pending-devices-delete.html
	 *
	 * @since Syncthing 1.18.0
	 *
	 * Remove records about a pending remote device which tried to connect.  Valid
	 * values for the ``device`` parameter are those from the corresponding
	 * `cluster-pending-devices-get` endpoint.
	 *
	 * @example
	 * ```bash
	 *     $ curl -X DELETE -H "X-API-Key: abc123" http://localhost:8384/rest/cluster/pending/devices?device=P56IOI7-MZJNU2Y-IQGDREY-DM2MGTI-MGL3BXN-PQ6W5BM-TBBZ4TJ-XZWICQ2
	 * ```
	 *
	 * Returns status 200 and no content upon success, or status 500 and a plain text error on failure.  A `/events/pendingdeviceschanged` event will be generated in response.
	 *
	 * For a more permanent effect, also for future connections from the same device ID, the device should be ignored in the `configuration </users/config>` instead.
	 */
	private async cluster_pending_devices(
		method: "GET" | "DELETE" = "GET",
		device?: string
	) {
		// TODO: implement DELETE
		return await this.requestEndpoint(
			"/rest/cluster/pending/devices",
			record(
				object({
					time: dateSchema,
					name: string(),
					address: string(),
				})
			),
			method
		);
	}

	/**
	 * GET /rest/cluster/pending/folders
	 * @see https://docs.syncthing.net/rest/cluster-pending-folders-get.html
	 *
	 * @since Syncthing 1.13.0
	 *
	 * Lists folders which remote devices have offered to us, but are not yet shared from our instance to them.
	 * Takes the optional ``device`` parameter to only return folders offered by a specific remote device.
	 * Other offering devices are also omitted from the result.
	 *
	 * @example
	 * ```json
	 *     {
	 *       "cpkn4-57ysy": {
	 *         "offeredBy": {
	 *           "P56IOI7-MZJNU2Y-IQGDREY-DM2MGTI-MGL3BXN-PQ6W5BM-TBBZ4TJ-XZWICQ2": {
	 *             "time": "2020-03-18T11:43:07Z",
	 *             "label": "Joe's folder",
	 *             "receiveEncrypted": true,
	 *             "remoteEncrypted": false
	 *           },
	 *           "DOVII4U-SQEEESM-VZ2CVTC-CJM4YN5-QNV7DCU-5U3ASRL-YVFG6TH-W5DV5AA": {
	 *             "time": "2020-03-01T10:12:13Z",
	 *             "label": "Jane's and Joe's folder",
	 *             "receiveEncrypted": false,
	 *             "remoteEncrypted": false
	 *           }
	 *         }
	 *       },
	 *       "abcde-fghij": {
	 *         "offeredBy": {
	 *           "P56IOI7-MZJNU2Y-IQGDREY-DM2MGTI-MGL3BXN-PQ6W5BM-TBBZ4TJ-XZWICQ2": {
	 *             "time": "2020-03-18T11:43:07Z",
	 *             "label": "MyPics",
	 *             "receiveEncrypted": false,
	 *             "remoteEncrypted": false
	 *           }
	 *         }
	 *       }
	 *     }
	 * ```
	 *
	 * ---
	 *
	 * DELETE /rest/cluster/pending/folders
	 * @see https://docs.syncthing.net/rest/cluster-pending-folders-delete.html
	 *
	 * @since Syncthing 1.18.0
	 *
	 * Remove records about a pending folder announced from a remote device.  Valid values for the ``folder`` and ``device`` parameters are those from the corresponding `cluster-pending-folders-get` endpoint.  The ``device`` parameter is optional and affects announcements of this folder from the given device, or from *any* device if omitted.
	 *
	 * @example
	 * ```bash
	 *     $ curl -X DELETE -H "X-API-Key: abc123" http://localhost:8384/rest/cluster/pending/folders?folder=cpkn4-57ysy&device=P56IOI7-MZJNU2Y-IQGDREY-DM2MGTI-MGL3BXN-PQ6W5BM-TBBZ4TJ-XZWICQ2
	 * ```
	 *
	 * Returns status 200 and no content upon success, or status 500 and a plain text error on failure.  A `/events/pendingfolderschanged` event will be generated in response.
	 *
	 * For a more permanent effect, also for future announcements of the same folder ID, the folder should be ignored in the `configuration </users/config>` instead.
	 *
	 */
	private async cluster_pending_folders(method: "GET" | "DELETE" = "GET") {
		// TODO: implement DELETE
		return await this.requestEndpoint(
			"/rest/cluster/pending/folders",
			record(
				object({
					offeredBy: record(
						object({
							time: dateSchema,
							label: string(),
							receiveEncrypted: boolean(),
							remoteEncrypted: boolean(),
						})
					),
				})
			),
			method
		);
	}

	//! Folder Endpoint
	//? https://docs.syncthing.net/dev/rest.html#folder-endpoint

	/**
	 * @see https://docs.syncthing.net/rest/folder-errors-get.html
	 */
	private async folder_errors(
		folder: string,
		page?: number,
		perpage?: number
	) {
		return await this.requestEndpoint(
			`/rest/folder/errors?folder=${folder}&page=${page}&perpage=${perpage}`,
			object({
				folder: string(),
				errors: array(object({ path: string(), error: string() })),
				page: number(),
				perpage: number(),
			})
		);
	}

	/**
	 * Takes one mandatory parameter, `folder`, and returns the list of archived files that could be recovered.
	 *
	 * How many versions are available depends on the File Versioning configuration.
	 *
	 * Each entry specifies when the file version was archived as the `versionTime`, the `modTime` when it was last modified before being archived, and the size in bytes.
	 *
	 * @see https://docs.syncthing.net/rest/folder-versions-get.html
	 */
	private async folder_versions(
		folder: string,
		method: "GET" | "POST" = "GET"
	) {
		// TODO: implement the POST method.
		return await this.requestEndpoint(
			`/rest/folder/versions?folder=${folder}`,
			record(
				object({
					versionTime: dateSchema,
					modTime: dateSchema,
					size: number(),
				})
			),
			method
		);
	}

	//! Database Endpoint
	//? https://docs.syncthing.net/dev/rest.html#database-endpoint

	/**
	 * Returns the directory tree of the global model.
	 * Directories are always JSON objects (map/dictionary), and files are always arrays of modification time and size.
	 * The first integer is the files modification time, and the second integer is the file size.
	 *
	 * The call takes one mandatory `folder` parameter and two optional parameters.
	 * Optional parameter `levels` defines how deep within the tree we want to dwell down (0 based, defaults to unlimited depth)
	 * Optional parameter `prefix` defines a prefix within the tree where to start building the structure.
	 *
	 * @see https://docs.syncthing.net/rest/db-browse-get.html
	 */
	private async db_browse(folder: string, levels?: number, prefix?: string) {
		const dbFileSchema = object({
			modTime: dateSchema,
			name: string(),
			size: number(),
			type: literal("FILE_INFO_TYPE_FILE"),
		});
		const dbFolderSchema = object({
			modTime: dateSchema,
			name: string(),
			size: number(),
			type: literal("FILE_INFO_TYPE_DIRECTORY"),

			children: nullable(array(dbFileSchema)),
		});
		// TODO: verify the schema and implementation. Not sure if it's correct.
		return await this.requestEndpoint(
			`/rest/db/browse?folder=${folder}&prefix=${prefix}&levels=${levels}`,
			array(union([dbFileSchema, dbFolderSchema]))
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/db-completion-get.html
	 */
	private async db_completion(folder?: string, device?: string) {
		return await this.requestEndpoint(
			`/rest/db/completion?folder=${folder}&device=${device}`,
			object({
				completion: number(),
				globalBytes: number(),
				globalItems: number(),
				needBytes: number(),
				needDeletes: number(),
				needItems: number(),
				remoteState: string(), // TODO: verify/make it more granular
				sequence: number(),
			})
		);
	}

	/**
	 * Returns most data available about a given file, including version and availability.
	 *
	 * Takes `folder` and `file` parameters.
	 * `local` and `global` refer to the current file on disk and the globally newest file, respectively.
	 * @see https://docs.syncthing.net/rest/db-file-get.html
	 */
	private async db_file(
		folder: string,
		file: string,
		local?: string,
		global?: string
	) {
		return await this.requestEndpoint(
			`/rest/db/file?folder=${folder}&file=${file}&local=${local}&global=${global}`,
			any() // TODO: add validation
		);
	}

	/**
	 * `GET` and `POST` methods.
	 *
	 * **GET /rest/db/ignores**
	 *
	 * Takes one parameter, `folder`, and returns the content of the `.stignore` as the `ignore` field.
	 * A second field, `expanded`, provides a list of strings which represent globbing patterns described by gobwas/glob (based on standard wildcards) that match the patterns in `.stignore` and all the includes.
	 * If appropriate these globs are prepended by the following modifiers: `!` to negate the glob, `(?i)` to do case insensitive matching and `(?d)` to enable removing of ignored files in an otherwise empty directory.
	 *
	 * @see https://docs.syncthing.net/rest/db-ignores-get.html
	 *
	 * **POST /rest/db/ignores**
	 *
	 * Expects a format similar to the output of GET /rest/db/ignores call, but only containing the `ignore` field (`expanded` field should be omitted).
	 * It takes one parameter, `folder`, and either updates the content of the `.stignore` echoing it back as a response, or returns an error.
	 *
	 * @see https://docs.syncthing.net/rest/db-ignores-post.html
	 */
	private async db_ignores(
		method: "GET" | "POST" = "GET",
		folder: string,
		input?: { ignore: string[] }
	) {
		return await this.requestEndpoint(
			`/rest/db/ignores?folder=${folder}`,
			object({
				error: nullable(array(string())),
				expanded: nullable(array(string())),
				ignore: nullable(array(string())),
			}),
			method,
			method == "POST" ? JSON.stringify(input) : ""
		);
	}

	/**
	 * Takes one mandatory parameter, `folder`, and returns the list of files which were changed locally in a receive-only folder. Thus they differ from the global state and could be reverted by pulling from remote devices again, see POST /rest/db/revert.
	 * @see https://docs.syncthing.net/rest/db-localchanged-get.html
	 */
	private async db_localchanged(
		folder: string,
		page?: number,
		perpage?: number
	) {
		const fileSchema = object({
			flags: string(),
			sequence: number(),
			modified: dateSchema,
			name: string(),
			size: number(),
			version: array(string()),
		});
		return await this.requestEndpoint(
			`/rest/db/localchanged?folder=${folder}&page=${page}&perpage=${perpage}`,
			object({
				files: array(fileSchema),
				page: number(),
				perpage: number(),
			})
		);
	}

	/**
	 * @see https://docs.syncthing.net/rest/db-need-get.html
	 */
	private async db_need(folder: string, page?: number, perpage?: number) {
		const fileSchema = object({
			flags: string(),
			sequence: number(),
			modified: dateSchema,
			name: string(),
			size: number(),
			version: array(string()),
		});
		return await this.requestEndpoint(
			`/rest/db/need?folder=${folder}&page=${page}&perpage=${perpage}`,
			object({
				progress: array(fileSchema),
				queued: array(fileSchema),
				rest: array(fileSchema),
				page: number(),
				perpage: number(),
			})
		);
	}

	/**
	 * Request override of a send only folder. Override means to make the local version latest, overriding changes made on other devices.
	 * This API call does nothing if the folder is not a send only folder.
	 *
	 * Takes the mandatory parameter folder (folder ID).
	 *
	 * @see https://docs.syncthing.net/rest/db-override-post.html
	 */
	private async db_override(folder: string) {
		return await this.requestEndpoint(
			"/rest/db/override",
			voidType(),
			"POST"
		);
	}

	/**
	 * Moves the file to the top of the download queue.
	 *
	 * Response contains the same output as GET /rest/db/need.
	 * @see https://docs.syncthing.net/rest/db-prio-post.html
	 */
	private async db_prio(folder: string, file: string) {
		const fileSchema = object({
			flags: string(),
			sequence: number(),
			modified: dateSchema,
			name: string(),
			size: number(),
			version: array(string()),
		});
		return await this.requestEndpoint(
			`/rest/db/prio?folder=${folder}&file=${file}`,
			object({
				progress: array(fileSchema),
				queued: array(fileSchema),
				rest: array(fileSchema),
				page: number(),
				perpage: number(),
			}),
			"POST"
		);
	}

	/**
	 * Similar to {@linkcode db_localchanged}, but returns the list of files which were changed remotely in a send-only folder.
	 * @see https://docs.syncthing.net/rest/db-remoteneed-get.html
	 */
	private async db_remoteneed(
		folder: string,
		device: string,
		page?: number,
		perpage?: number
	) {
		const fileSchema = object({
			flags: string(),
			sequence: number(),
			modified: dateSchema,
			name: string(),
			size: number(),
			version: array(string()),
		});
		return await this.requestEndpoint(
			`/rest/db/remoteneed?folder=${folder}&device=${device}&page=${page}&perpage=${perpage}`,
			object({
				files: array(fileSchema),
				page: number(),
				perpage: number(),
			})
		);
	}

	/**
	 * Request revert of a receive only folder.
	 * Reverting a folder means to undo all local changes.
	 * This API call does nothing if the folder is not a receive only folder.
	 *
	 * Takes the mandatory parameter folder (folder ID).
	 * @see https://docs.syncthing.net/rest/db-revert-post.html
	 */
	private async db_revert(folder: string) {
		return await this.requestEndpoint(
			`/rest/db/revert?folder=${folder}`,
			voidType(),
			"POST"
		);
	}

	/**
	 * Request immediate scan.
	 *
	 * Takes the optional parameters `folder` (folder ID), `sub` (path relative to the folder root) and `next` (time in seconds).
	 * If `folder` is omitted or empty all folders are scanned.
	 * If `sub` is given, only this path (and children, in case it’s a directory) is scanned.
	 * The `next` argument delays Syncthing’s automated rescan interval for a given amount of seconds.
	 *
	 * Requesting scan of a path that no longer exists, but previously did, is valid and will result in Syncthing noticing the deletion of the path in question.
	 *
	 * Returns status 200 and no content upon success, or status 500 and a plain text error if an error occurred during scanning.
	 *
	 * @see https://docs.syncthing.net/rest/db-scan-post.html
	 */
	private async db_scan(folder?: string, sub?: string, next?: number) {
		return await this.requestEndpoint(
			`/rest/db/scan?folder=${folder}&sub=${sub}&next=${next}`,
			voidType(),
			"POST"
		);
	}

	/**
	 * Returns information about the current status of a folder.
	 *
	 * Parameters: `folder`, the ID of a folder.
	 *
	 * @see https://docs.syncthing.net/rest/db-status-get.html
	 */
	private async db_status(folder: string) {
		return await this.requestEndpoint(
			`/rest/db/status?folder=${folder}`,
			object({
				errors: number(),
				pullErrors: number(),
				invalid: string(),
				globalFiles: number(),
				globalDirectories: number(),
				globalSymlinks: number(),
				globalDeleted: number(),
				globalBytes: number(),
				globalTotalItems: number(),
				localFiles: number(),
				localDirectories: number(),
				localSymlinks: number(),
				localDeleted: number(),
				localBytes: number(),
				localTotalItems: number(),
				needFiles: number(),
				needDirectories: number(),
				needSymlinks: number(),
				needDeletes: number(),
				needBytes: number(),
				needTotalItems: number(),
				receiveOnlyChangedFiles: number(),
				receiveOnlyChangedDirectories: number(),
				receiveOnlyChangedSymlinks: number(),
				receiveOnlyChangedDeletes: number(),
				receiveOnlyChangedBytes: number(),
				receiveOnlyTotalItems: number(),
				inSyncFiles: number(),
				inSyncBytes: number(),
				state: string(),
				stateChanged: dateSchema,
				error: string(),
				version: number(),
				sequence: number(),
				ignorePatterns: boolean(),
				watchError: string(),
			})
		);
	}

	//! Event Endpoint
	//? https://docs.syncthing.net/dev/events.html

	/**
	 * @see https://docs.syncthing.net/rest/events-get.html
	 */
	private async events(
		eventsFilter?: Output<typeof SyncthingEventTypes>[],
		lastSeenID?: number,
		timeout?: number,
		limit?: number
	) {
		return await this.requestEndpoint(
			`/rest/events?events=${eventsFilter}&since=${lastSeenID}&timeout=${timeout}&limit=${limit}`,
			array(UnionSyncthingEvents)
		);
	}

	/**
	 * This convenience endpoint provides the same event stream, but pre-filtered to show only LocalChangeDetected and RemoteChangeDetected event types.
	 * The events parameter is not used.
	 *
	 * @see https://docs.syncthing.net/rest/events-get.html#get-rest-events-disk
	 */
	private async disk(lastSeenID?: number, timeout?: number, limit?: number) {
		return await this.requestEndpoint(
			`/rest/events/disk?since=${lastSeenID}&timeout=${timeout}&limit=${limit}`,
			array(UnionSyncthingEvents)
		);
	}

	//! Statistics Endpoint
	//? https://docs.syncthing.net/dev/rest.html#statistics-endpoint

	/**
	 * Returns general statistics about devices.
	 * Currently, only contains the time the device was last seen and the last connection duration.
	 * @see https://docs.syncthing.net/rest/stats-device-get.html
	 */
	private async stats_device() {
		return await this.requestEndpoint(
			"/rest/stats/device",
			record(
				object({
					lastSeen: dateSchema,
					lastConnectionDurationS: number(),
				})
			)
		);
	}

	/**
	 * Returns general statistics about folders.
	 * Currently contains the last scan time and the last synced file.
	 *
	 * @see https://docs.syncthing.net/rest/stats-folder-get.html
	 */
	private async stats_folder() {
		return await this.requestEndpoint(
			"/rest/stats/folder",
			record(
				object({
					lastScan: dateSchema,
					lastFile: object({
						filename: string(),
						at: dateSchema,
					}),
				})
			)
		);
	}

	//! Misc Endpoint
	//? https://docs.syncthing.net/dev/rest.html#misc-endpoint

	/**
	 * Verifies and formats a device ID.
	 *
	 * Accepts all currently valid formats (52 or 56 characters with or without separators, upper or lower case, with trivial substitutions).
	 *
	 * Takes one parameter, ``id``, and returns either a valid device ID in modern format, or an error.
	 *
	 * @see https://docs.syncthing.net/rest/svc-deviceid-get.html
	 */
	private async svc_deviceid(id: string) {
		// TODO implement
		return await this.requestEndpoint(
			`/rest/svc/deviceid?id=${id}`,
			union([object({ error: string() }), object({ id: string() })])
		);
	}

	/**
	 * Returns a list of canonicalized localization codes, as picked up from the ``Accept-Language`` header sent by the browser.
	 *
	 * @example ["sv_sv","sv","en_us","en"]
	 *
	 * @see https://docs.syncthing.net/rest/svc-lang-get.html
	 */
	private async svc_lang() {
		return await this.requestEndpoint("/rest/svc/lang", array(string()));
	}

	/**
	 * Returns a strong random generated string (alphanumeric) of the specified length. Takes the ``length`` parameter.
	 *
	 * @example { "random": "FdPaEaZQ56sXEKYNxpgF" }
	 *
	 * @see https://docs.syncthing.net/rest/svc-random-string-get.html
	 */
	private async svc_random_string(length?: number) {
		return await this.requestEndpoint(
			`/rest/svc/random/string${length ? `?length=${length}` : ""}`,
			object({ random: string() })
		);
	}

	/**
	 * Returns the data sent in the anonymous usage report.
	 *
	 * IMPORTANT: there is no validation made on this endpoint, as it can easily change and it would not be used in the integration. Thus, it returns an `any` type.
	 *
	 * @see https://docs.syncthing.net/rest/svc-report-get.html
	 */
	private async svc_report() {
		return await this.requestEndpoint(
			"/rest/svc/report",
			any()
			// ^ Do not perform any validation as the data report can change in future version.
		);
	}

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

	//! Formatting the endpoints in objects.

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
		devices: this.cluster_pending_devices,
		folders: this.cluster_pending_folders,
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

	/**
	 * @todo not implemented yet.
	 */
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
		method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
		body?: string | ArrayBuffer,
		contentType = "application/json"
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
				"Content-Type": contentType,
				"Access-Control-Allow-Origin": "*",
				redirect: "follow",
			},
			body: body,
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
