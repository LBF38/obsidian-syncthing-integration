import { describe, expect, it } from "vitest";
import { safeParse } from "valibot";
import { readFixture, readFixtureJson } from "../../test/helpers/fixtures";
import {
	ReducedSyncthingDevice,
	SyncTypes,
	SyncthingConfiguration,
	SyncthingDevice,
	SyncthingDeviceStats,
	SyncthingFolder,
	SyncthingFolderStats,
	SyncthingSystemStatus,
	SyncthingVersion,
} from "./entities";

function parseFixture(name: string): unknown {
	return JSON.parse(readFixture(name)) as unknown;
}

describe("SyncTypes", () => {
	it("accepts every documented sync type", () => {
		for (const type of [
			"sendreceive",
			"sendonly",
			"receiveonly",
			"receiveencrypted",
		]) {
			expect(safeParse(SyncTypes, type).success).toBe(true);
		}
	});

	it("rejects an unknown sync type", () => {
		expect(safeParse(SyncTypes, "sendenforce").success).toBe(false);
	});
});

describe("SyncthingDevice", () => {
	it("parses a device from the REST/CLI fixture", () => {
		const devices = readFixtureJson<unknown[]>("devices.json");
		const result = safeParse(SyncthingDevice, devices[1]);

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.deviceID).toContain("IIIIIII");
		expect(result.output.name).toBe("remote-device");
		expect(result.output.paused).toBe(true);
		expect(result.output.addresses).toEqual([
			"tcp://192.168.0.10:22000",
			"dynamic",
		]);
	});

	it("rejects a device that is missing its addresses", () => {
		expect(
			safeParse(
				SyncthingDevice,
				parseFixture("device.missing-addresses.json"),
			).success,
		).toBe(false);
	});
});

describe("ReducedSyncthingDevice", () => {
	it("only requires the deviceID and introducedBy fields", () => {
		const result = safeParse(ReducedSyncthingDevice, {
			deviceID: "AAAAAAA",
			introducedBy: "",
			encryptionPassword: "",
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output).toEqual({ deviceID: "AAAAAAA", introducedBy: "" });
	});

	it("rejects a device without a deviceID", () => {
		expect(safeParse(ReducedSyncthingDevice, { introducedBy: "" }).success).toBe(
			false,
		);
	});
});

describe("SyncthingFolder", () => {
	it("parses a folder from the REST/CLI fixture", () => {
		const folders = readFixtureJson<unknown[]>("folders.json");
		const result = safeParse(SyncthingFolder, folders[0]);

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.id).toBe("default");
		expect(result.output.label).toBe("Default Folder");
		expect(result.output.path).toBe("/home/user/Notes");
		expect(result.output.filesystemType).toBe("basic");
		expect(result.output.type).toBe("sendreceive");
		expect(result.output.maxConflicts).toBe(10);
		expect(result.output.devices).toHaveLength(2);
	});

	it("rejects a folder that is missing its devices", () => {
		expect(
			safeParse(SyncthingFolder, parseFixture("folder.missing-devices.json"))
				.success,
		).toBe(false);
	});
});

describe("SyncthingConfiguration", () => {
	it("parses the full configuration fixture", () => {
		const result = safeParse(
			SyncthingConfiguration,
			readFixtureJson("config.json"),
		);

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.version).toBe(37);
		expect(result.output.folders).toHaveLength(2);
		expect(result.output.devices).toHaveLength(2);
		expect(result.output.gui.apiKey).toBe("test-api-key");
		expect(result.output.defaults.ignores.lines).toEqual([]);
	});

	it("rejects a configuration that is missing its folders", () => {
		expect(
			safeParse(
				SyncthingConfiguration,
				parseFixture("config.missing-folders.json"),
			).success,
		).toBe(false);
	});

	it("rejects a configuration whose version is not a number", () => {
		const config = readFixtureJson<Record<string, unknown>>("config.json");
		const result = safeParse(SyncthingConfiguration, {
			...config,
			version: "37",
		});

		expect(result.success).toBe(false);
	});
});

describe("SyncthingSystemStatus", () => {
	const status = {
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
		myID: "AAAAAAA",
		pathSeparator: "/",
		startTime: "2024-01-01T00:00:00Z",
		sys: 0,
		tilde: "/home/user",
		uptime: 1,
		urVersionMax: 3,
	};

	it("parses a system status and converts timestamps to Date", () => {
		const result = safeParse(SyncthingSystemStatus, status);

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.myID).toBe("AAAAAAA");
		expect(result.output.startTime).toBeInstanceOf(Date);
	});

	it("rejects a system status without the required identity", () => {
		expect(
			safeParse(SyncthingSystemStatus, { ...status, myID: undefined }).success,
		).toBe(false);
	});
});

describe("SyncthingVersion", () => {
	it("parses the version object", () => {
		const result = safeParse(SyncthingVersion, {
			arch: "amd64",
			longVersion: "syncthing v1.27.0",
			os: "linux",
			version: "v1.27.0",
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.version).toBe("v1.27.0");
	});

	it("rejects an incomplete version object", () => {
		expect(safeParse(SyncthingVersion, { version: "v1.27.0" }).success).toBe(
			false,
		);
	});
});

describe("statistics schemas", () => {
	it("parses device statistics keyed by device ID", () => {
		const result = safeParse(SyncthingDeviceStats, {
			AAAAAAA: {
				lastSeen: "2024-01-01T00:00:00Z",
				lastConnectionDurationS: 42,
			},
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.AAAAAAA.lastSeen).toBeInstanceOf(Date);
	});

	it("parses folder statistics including the last file", () => {
		const result = safeParse(SyncthingFolderStats, {
			default: {
				lastScan: "2024-01-01T00:00:00Z",
				lastFile: {
					filename: "Note.md",
					at: "2024-01-01T00:00:00Z",
				},
			},
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.default.lastFile.filename).toBe("Note.md");
		expect(result.output.default.lastFile.at).toBeInstanceOf(Date);
	});

	it("rejects folder statistics without a last file", () => {
		expect(
			safeParse(SyncthingFolderStats, {
				default: { lastScan: "2024-01-01T00:00:00Z" },
			}).success,
		).toBe(false);
	});
});
