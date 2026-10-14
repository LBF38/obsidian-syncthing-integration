import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { readFixture, readFixtureJson } from "../../test/helpers/fixtures";
import {
	ReducedSyncthingDeviceModel,
	SyncthingConfigurationModel,
	SyncthingDeviceModel,
	SyncthingFolderModel,
} from "./models";

let consoleError: MockInstance;

beforeEach(() => {
	// `fromJSON` logs each parsed folder to the console, and the numeric /
	// boolean field checks always report an error (see `validateJsonField`).
	// Silence both to keep the test output readable.
	vi.spyOn(console, "log").mockImplementation(() => {});
	consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("SyncthingConfigurationModel", () => {
	it("parses a full configuration from JSON", () => {
		const model = SyncthingConfigurationModel.fromJSON(
			readFixture("config.json"),
		);

		expect(model.version).toBe("37");
		expect(model.folders).toHaveLength(2);
		expect(model.devices).toHaveLength(2);
		expect(model.url).toEqual({
			protocol: "http",
			ip_address: "localhost",
			port: 8384,
		});
	});

	it("parses nested folders and devices", () => {
		const model = SyncthingConfigurationModel.fromJSON(
			readFixture("config.json"),
		);
		const folder = model.folders[0];
		const device = model.devices[1];

		expect(folder).toBeInstanceOf(SyncthingFolderModel);
		expect(folder.id).toBe("default");
		expect(folder.type).toBe("sendreceive");
		expect(folder.maxConflicts).toBe(10);
		expect(folder.devices).toHaveLength(2);
		expect(folder.devices[0]).toBeInstanceOf(ReducedSyncthingDeviceModel);

		expect(device).toBeInstanceOf(SyncthingDeviceModel);
		expect(device.deviceID).toContain("IIIIIII");
		expect(device.name).toBe("remote-device");
		expect(device.paused).toBe(true);
		expect(device.address).toEqual([
			"tcp://192.168.0.10:22000",
			"dynamic",
		]);
	});

	it("throws when the JSON is not an object", () => {
		expect(() => SyncthingConfigurationModel.fromJSON("null")).toThrow(
			"JSON is not an object or is null",
		);
	});

	it("throws on invalid JSON syntax", () => {
		expect(() => SyncthingConfigurationModel.fromJSON("not json")).toThrow();
	});

	it("throws when required fields are missing", () => {
		expect(() =>
			SyncthingConfigurationModel.fromJSON(
				readFixture("config.missing-folders.json"),
			),
		).toThrow("Error parsing JSON: missing fields or wrong type");
	});

	it("logs an error when an optional field is invalid but still parses", () => {
		const model = SyncthingConfigurationModel.fromJSON(
			'{"version":37,"folders":[],"devices":[]}',
		);

		expect(consoleError).toHaveBeenCalled();
		expect(model.folders).toEqual([]);
		expect(model.devices).toEqual([]);
	});

	it("overflows the stack when serialized back to JSON", () => {
		// `toJSON` is implemented as `JSON.stringify(this)`, and because the
		// class exposes a `toJSON` method, `JSON.stringify` calls it again
		// recursively. This documents the current behaviour.
		const model = SyncthingConfigurationModel.fromJSON(
			readFixture("config.json"),
		);
		expect(() => model.toJSON()).toThrow(RangeError);
	});
});

describe("SyncthingFolderModel", () => {
	it("parses a folder from the folders fixture", () => {
		const folders = readFixtureJson<unknown[]>("folders.json");
		const folder = SyncthingFolderModel.fromJSON(JSON.stringify(folders[0]));

		expect(folder.id).toBe("default");
		expect(folder.label).toBe("Default Folder");
		expect(folder.path).toBe("/home/user/Notes");
		expect(folder.filesystemType).toBe("basic");
		expect(folder.type).toBe("sendreceive");
		expect(folder.maxConflicts).toBe(10);
		expect(folder.devices).toHaveLength(2);
		expect(folder.devices[0].deviceID).toContain("AAAAAAA");
	});

	it("throws when devices are missing", () => {
		expect(() =>
			SyncthingFolderModel.fromJSON(
				readFixture("folder.missing-devices.json"),
			),
		).toThrow(
			"Error validating JSON: devices is not present or is not an array",
		);
	});

	it("throws when the JSON is not an object", () => {
		expect(() => SyncthingFolderModel.fromJSON("null")).toThrow(
			"JSON is not an object or is null",
		);
	});
});

describe("SyncthingDeviceModel", () => {
	it("parses a device", () => {
		const devices = readFixtureJson<unknown[]>("devices.json");
		const device = SyncthingDeviceModel.fromJSON(JSON.stringify(devices[0]));

		expect(device.deviceID).toContain("AAAAAAA");
		expect(device.introducedBy).toBe("");
		expect(device.address).toEqual(["dynamic"]);
		expect(device.paused).toBe(false);
		expect(device.ignoredFolders).toEqual([]);
		expect(device.name).toBe("local-device");
	});

	it("overflows the stack when serialized back to JSON", () => {
		const devices = readFixtureJson<unknown[]>("devices.json");
		const device = SyncthingDeviceModel.fromJSON(JSON.stringify(devices[1]));
		expect(() => device.toJSON()).toThrow(RangeError);
	});

	it("throws when addresses are missing", () => {
		expect(() =>
			SyncthingDeviceModel.fromJSON(
				readFixture("device.missing-addresses.json"),
			),
		).toThrow("Error validating JSON");
	});

	it("throws when the JSON is not an object", () => {
		expect(() => SyncthingDeviceModel.fromJSON("null")).toThrow(
			"JSON is not an object or is null",
		);
	});
});

describe("ReducedSyncthingDeviceModel", () => {
	const raw = JSON.stringify({
		deviceID: "AAAAAAA",
		introducedBy: "",
		encryptionPassword: "",
	});

	it("parses a reduced device", () => {
		const device = ReducedSyncthingDeviceModel.fromJSON(raw);
		expect(device.deviceID).toBe("AAAAAAA");
		expect(device.encryptionPassword).toBe("");
	});

	it("does not implement toJSON", () => {
		const device = ReducedSyncthingDeviceModel.fromJSON(raw);
		expect(() => device.toJSON()).toThrow("Method not implemented.");
	});

	it("throws when the JSON is not an object", () => {
		expect(() => ReducedSyncthingDeviceModel.fromJSON("null")).toThrow(
			"Error parsing JSON",
		);
	});
});
