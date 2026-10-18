import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Platform, requestUrl } from "obsidian";
import type { Output } from "valibot";
import type { SyncthingDevice } from "src/models/entities";
import { RestFailure } from "src/models/failures";
import { readFixtureJson } from "../../test/helpers/fixtures";
import { asPlugin, makePlugin } from "../../test/helpers/plugin";
import { SyncthingFromREST } from "./syncthing_remote_datasource";

const mockRequestUrl = vi.mocked(requestUrl);

function response(body: unknown, status = 200): {
	status: number;
	headers: Record<string, string>;
	arrayBuffer: ArrayBuffer;
	json: unknown;
	text: string;
} {
	return {
		status,
		headers: {},
		arrayBuffer: new ArrayBuffer(0),
		json: body,
		text: typeof body === "string" ? body : JSON.stringify(body),
	};
}

function systemStatus(): Record<string, unknown> {
	return {
		alloc: 0,
		connectionServiceStatus: {},
		discoveryEnabled: true,
		discoveryErrors: {},
		discoveryStatus: {},
		discoveryMethods: 0,
		goroutines: 1,
		guiAddressOverridden: false,
		guiAddressUsed: "127.0.0.1:8384",
		lastDialStatus: {},
		myID: "AAAAAAA-BBBBBBB",
		pathSeparator: "/",
		startTime: "2024-01-01T00:00:00Z",
		sys: 0,
		tilde: "/home/user",
		uptime: 1,
		urVersionMax: 3,
	};
}

let rest: SyncthingFromREST;
let plugin: ReturnType<typeof makePlugin>;

beforeEach(() => {
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
	plugin = makePlugin([], { api_key: "test-api-key" });
	rest = new SyncthingFromREST(asPlugin(plugin));
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("SyncthingFromREST.ping", () => {
	it("returns pong when Syncthing responds", async () => {
		mockRequestUrl.mockResolvedValue(response({ ping: "pong" }));

		await expect(rest.ping()).resolves.toBe("pong");
	});

	it("builds the request from the plugin settings", async () => {
		mockRequestUrl.mockResolvedValue(response({ ping: "pong" }));

		await rest.ping();

		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "http://localhost:8384/rest/system/ping",
				method: "GET",
				headers: expect.objectContaining({ "X-API-Key": "test-api-key" }),
			}),
		);
	});

	it("sends a GET request without a body", async () => {
		mockRequestUrl.mockResolvedValue(response({ ping: "pong" }));

		await rest.ping();

		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({ body: undefined }),
		);
	});

	it("uses 127.0.0.1 on mobile when the host is localhost", async () => {
		Platform.isMobileApp = true;
		mockRequestUrl.mockResolvedValue(response({ ping: "pong" }));

		await rest.ping();

		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "http://127.0.0.1:8384/rest/system/ping",
			}),
		);
	});

	it("rejects with a RestFailure on an HTTP error status", async () => {
		mockRequestUrl.mockResolvedValue(response("Forbidden", 403));

		await expect(rest.ping()).rejects.toBeInstanceOf(RestFailure);
	});

	it("rejects with a RestFailure when the request itself fails", async () => {
		mockRequestUrl.mockRejectedValue(new Error("network down"));

		await expect(rest.ping()).rejects.toThrow("network down");
	});

	it("rejects with a RestFailure when the payload does not match", async () => {
		mockRequestUrl.mockResolvedValue(response({ ping: "nope" }));

		await expect(rest.ping()).rejects.toBeInstanceOf(RestFailure);
	});
});

describe("SyncthingFromREST.getAllFolders", () => {
	it("parses the folders from the REST response", async () => {
		const folders = readFixtureJson<unknown[]>("folders.json");
		mockRequestUrl.mockResolvedValue(response(folders));

		const result = await rest.getAllFolders();

		expect(result).toHaveLength(2);
		expect(result[0].id).toBe("default");
		expect(result[0].devices).toHaveLength(2);
		expect(result[1].id).toBe("work");
		expect(result[1].type).toBe("sendonly");
		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "http://localhost:8384/rest/config/folders",
			}),
		);
	});

	it("rejects with a RestFailure when a folder is invalid", async () => {
		mockRequestUrl.mockResolvedValue(
			response([readFixtureJson("folder.missing-devices.json")]),
		);

		await expect(rest.getAllFolders()).rejects.toBeInstanceOf(RestFailure);
	});
});

describe("SyncthingFromREST.getDevices", () => {
	it("parses the devices from the REST response", async () => {
		const devices = readFixtureJson<unknown[]>("devices.json");
		mockRequestUrl.mockResolvedValue(response(devices));

		const result = await rest.getDevices();

		expect(result).toHaveLength(2);
		expect(result[0].name).toBe("local-device");
		expect(result[1].name).toBe("remote-device");
		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "http://localhost:8384/rest/config/devices",
			}),
		);
	});
});

describe("SyncthingFromREST.getFoldersForDevice", () => {
	it("keeps only the folders shared with the given device", async () => {
		const folders = readFixtureJson<unknown[]>("folders.json");
		const devices = readFixtureJson<unknown[]>("devices.json");
		mockRequestUrl.mockResolvedValue(response(folders));

		const device = devices[1] as Output<typeof SyncthingDevice>;
		const result = await rest.getFoldersForDevice(device);

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe("default");
	});

	it("returns an empty list when the device shares no folder", async () => {
		const folders = readFixtureJson<unknown[]>("folders.json");
		mockRequestUrl.mockResolvedValue(response(folders));

		const result = await rest.getFoldersForDevice({
			deviceID: "UNKNOWN",
		} as Output<typeof SyncthingDevice>);

		expect(result).toEqual([]);
	});
});

describe("SyncthingFromREST.getConfiguration", () => {
	it("parses the configuration returned by the REST API", async () => {
		mockRequestUrl.mockResolvedValue(
			response(readFixtureJson("config.json")),
		);

		const config = await rest.getConfiguration();

		expect(config.version).toBe(37);
		expect(config.folders).toHaveLength(2);
		expect(config.gui.apiKey).toBe("test-api-key");
		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "http://localhost:8384/rest/config",
			}),
		);
	});

	it("rejects with a RestFailure when the configuration is invalid", async () => {
		mockRequestUrl.mockResolvedValue(
			response(readFixtureJson("config.missing-folders.json")),
		);

		await expect(rest.getConfiguration()).rejects.toBeInstanceOf(RestFailure);
	});
});

describe("SyncthingFromREST.getSystemStatus", () => {
	it("parses the system status and exposes the device ID", async () => {
		mockRequestUrl.mockResolvedValue(response(systemStatus()));

		const status = await rest.getSystemStatus();

		expect(status.myID).toBe("AAAAAAA-BBBBBBB");
		expect(status.startTime).toBeInstanceOf(Date);
		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "http://localhost:8384/rest/system/status",
			}),
		);
	});
});

describe("SyncthingFromREST.getVersion", () => {
	it("parses the version response", async () => {
		mockRequestUrl.mockResolvedValue(
			response({
				arch: "amd64",
				longVersion: "syncthing v1.27.0",
				os: "linux",
				version: "v1.27.0",
			}),
		);

		await expect(rest.getVersion()).resolves.toMatchObject({
			version: "v1.27.0",
		});
	});
});

describe("SyncthingFromREST.checkHealth", () => {
	it("resolves to true when the health endpoint reports OK", async () => {
		mockRequestUrl.mockResolvedValue(response({ status: "OK" }));

		await expect(rest.checkHealth()).resolves.toBe(true);
	});

	it("rejects when the health endpoint reports an unexpected status", async () => {
		mockRequestUrl.mockResolvedValue(response({ status: "KO" }));

		await expect(rest.checkHealth()).rejects.toBeInstanceOf(RestFailure);
	});
});

describe("SyncthingFromREST.isRestartRequired", () => {
	it("returns the requiresRestart flag", async () => {
		mockRequestUrl.mockResolvedValue(response({ requiresRestart: true }));

		await expect(rest.isRestartRequired()).resolves.toBe(true);
	});
});

describe("SyncthingFromREST.restart", () => {
	it("posts to the restart endpoint", async () => {
		mockRequestUrl.mockResolvedValue(response({}));

		await rest.restart();

		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "http://localhost:8384/rest/system/restart",
				method: "POST",
			}),
		);
	});
});
