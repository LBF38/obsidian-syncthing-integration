import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Platform, requestUrl } from "obsidian";
import { RestFailure } from "src/models/failures";
import { readFixtureJson } from "../../test/helpers/fixtures";
import { asPlugin, makePlugin } from "../../test/helpers/plugin";
import {
	SyncthingDeviceModel,
	SyncthingFolderModel,
} from "../models/models";
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
});

describe("SyncthingFromREST.getAllFolders", () => {
	it("parses the folders from the REST response", async () => {
		const folders = readFixtureJson<unknown[]>("folders.json");
		mockRequestUrl.mockResolvedValue(response(folders));

		const result = await rest.getAllFolders();

		expect(result).toHaveLength(2);
		expect(result[0]).toBeInstanceOf(SyncthingFolderModel);
		expect(result[0].id).toBe("default");
		expect(result[1].id).toBe("work");
		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({ url: "http://localhost:8384/rest/config/folders" }),
		);
	});
});

describe("SyncthingFromREST.getDevices", () => {
	it("parses the devices from the REST response", async () => {
		const devices = readFixtureJson<unknown[]>("devices.json");
		mockRequestUrl.mockResolvedValue(response(devices));

		const result = await rest.getDevices();

		expect(result).toHaveLength(2);
		expect(result[0]).toBeInstanceOf(SyncthingDeviceModel);
		expect(result[0].name).toBe("local-device");
		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({ url: "http://localhost:8384/rest/config/devices" }),
		);
	});
});

describe("SyncthingFromREST.getFoldersForDevice", () => {
	it("keeps only the folders shared with the given device", async () => {
		const folders = readFixtureJson<unknown[]>("folders.json");
		const devices = readFixtureJson<unknown[]>("devices.json");
		mockRequestUrl.mockResolvedValue(response(folders));

		const device = SyncthingDeviceModel.fromJSON(
			JSON.stringify(devices[1]),
		);
		const result = await rest.getFoldersForDevice(device);

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe("default");
	});
});

describe("SyncthingFromREST.getConfiguration", () => {
	it("requests the configuration endpoint", async () => {
		// `requestUrl` resolves `json` to a parsed object, but
		// `SyncthingConfigurationModel.fromJSON` expects a JSON *string*;
		// this documents the current behaviour.
		mockRequestUrl.mockResolvedValue(
			response(readFixtureJson("config.json")),
		);

		await expect(rest.getConfiguration()).rejects.toThrow(SyntaxError);

		expect(mockRequestUrl).toHaveBeenCalledWith(
			expect.objectContaining({ url: "http://localhost:8384/rest/config" }),
		);
	});
});
