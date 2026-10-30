import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { Platform, type TFile } from "obsidian";
import type { SyncthingFromAndroid } from "src/data/syncthing_android_datasource";
import type { SyncthingFromCLI } from "src/data/syncthing_local_datasource";
import type { SyncthingFromREST } from "src/data/syncthing_remote_datasource";
import type SyncthingPlugin from "src/main";
import { type SyncthingConfiguration } from "src/models/entities";
import { CliFailure, Failure, RestFailure } from "src/models/failures";
import type { Output } from "valibot";
import { makeConflictFile, makeFile } from "../../test/helpers/files";
import {
	asPlugin,
	makePlugin,
	type FakePlugin,
} from "../../test/helpers/plugin";
import { SyncthingController } from "./main_controller";

interface ControllerHarness {
	controller: SyncthingController;
	cli: {
		getVersion: Mock;
		getConfiguration: Mock;
		getAPIkey: Mock;
		startSyncthing: Mock;
		stopSyncthing: Mock;
	};
	rest: {
		ping: Mock;
		config: { all: Mock };
		getDevices: Mock;
		getAllFolders: Mock;
	};
	android: { hasSyncthing: Mock };
	plugin: FakePlugin;
}

function makeHarness(files: TFile[] = [], settings = {}): ControllerHarness {
	const cli = {
		getVersion: vi.fn(),
		getConfiguration: vi.fn(),
		getAPIkey: vi.fn(),
		startSyncthing: vi.fn(),
		stopSyncthing: vi.fn(),
	};
	const rest = {
		ping: vi.fn(),
		config: { all: vi.fn() },
		getDevices: vi.fn(),
		getAllFolders: vi.fn(),
	};
	const android = { hasSyncthing: vi.fn() };
	const plugin = makePlugin(files, settings);
	const controller = new SyncthingController(
		cli as unknown as SyncthingFromCLI,
		rest as unknown as SyncthingFromREST,
		android as unknown as SyncthingFromAndroid,
		asPlugin(plugin) as SyncthingPlugin,
	);
	return { controller, cli, rest, android, plugin };
}

const CONFIG = {
	version: 37,
	folders: [],
	devices: [],
} as unknown as Output<typeof SyncthingConfiguration>;

beforeEach(() => {
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("SyncthingController.isRunning", () => {
	it("returns true when the REST ping succeeds", async () => {
		const { controller, rest } = makeHarness();
		rest.ping.mockResolvedValue("pong");

		await expect(controller.isRunning()).resolves.toBe(true);
	});

	it("returns false when the REST ping fails", async () => {
		const { controller, rest } = makeHarness();
		rest.ping.mockRejectedValue(new Error("offline"));

		await expect(controller.isRunning()).resolves.toBe(false);
	});
});

describe("SyncthingController status helpers", () => {
	it("getCLIStatus delegates to the CLI datasource", async () => {
		const { controller, cli } = makeHarness();
		cli.getVersion.mockResolvedValue("syncthing v1.27.0");

		await expect(controller.getCLIStatus()).resolves.toBe("syncthing v1.27.0");
	});

	it("getAPIStatus reports a missing API key", async () => {
		const { controller, rest } = makeHarness();

		await expect(controller.getAPIStatus()).resolves.toBe(
			"API key is not set.",
		);
		expect(rest.ping).not.toHaveBeenCalled();
	});

	it("getAPIStatus pings the REST API when a key is set", async () => {
		const { controller, rest } = makeHarness([], { api_key: "key" });
		rest.ping.mockResolvedValue("pong");

		await expect(controller.getAPIStatus()).resolves.toBe("pong");
	});
});

describe("SyncthingController.hasSyncthing", () => {
	it("uses the Android datasource on Android", async () => {
		Platform.isAndroidApp = true;
		const { controller, android, cli } = makeHarness();
		android.hasSyncthing.mockResolvedValue(true);

		await expect(controller.hasSyncthing()).resolves.toBe(true);
		expect(cli.getVersion).not.toHaveBeenCalled();
	});

	it("returns false on iOS", async () => {
		Platform.isIosApp = true;
		const { controller } = makeHarness();

		await expect(controller.hasSyncthing()).resolves.toBe(false);
	});

	it("returns true when the CLI version is available", async () => {
		const { controller, cli } = makeHarness();
		cli.getVersion.mockResolvedValue("syncthing v1.27.0");

		await expect(controller.hasSyncthing()).resolves.toBe(true);
	});

	it("falls back to the REST API when the CLI fails", async () => {
		const { controller, cli, rest } = makeHarness();
		cli.getVersion.mockRejectedValue(new Error("no cli"));
		rest.ping.mockResolvedValue("pong");

		await expect(controller.hasSyncthing()).resolves.toBe(true);
	});

	it("returns false when neither CLI nor REST work", async () => {
		const { controller, cli, rest } = makeHarness();
		cli.getVersion.mockRejectedValue(new Error("no cli"));
		rest.ping.mockRejectedValue(new Error("no rest"));

		await expect(controller.hasSyncthing()).resolves.toBe(false);
	});
});

describe("SyncthingController.getConflictsWithOriginal", () => {
	const original = makeFile("Notes/Note.md");
	const conflictA = makeConflictFile({
		filename: "Note",
		date: "20210101",
		time: "000000",
		modifiedBy: "AAAAAAA",
	});
	const conflictB = makeConflictFile({
		filename: "Note",
		date: "20220101",
		time: "000000",
		modifiedBy: "BBBBBBB",
	});
	const other = makeFile("Other.md");
	const files = [original, conflictA, conflictB, other];

	it("returns the original file and its conflicts for a conflict file", async () => {
		const { controller } = makeHarness(files);

		const result = await controller.getConflictsWithOriginal(conflictA);

		expect(result.originalFile).toBe(original);
		expect(result.conflicts).toEqual([conflictA, conflictB]);
	});

	it("returns only the conflicts for a regular file", async () => {
		const { controller } = makeHarness(files);

		const result = await controller.getConflictsWithOriginal(original);

		expect(result.originalFile).toBeUndefined();
		expect(result.conflicts).toEqual([conflictA, conflictB]);
	});
});

describe("SyncthingController.getConflicts", () => {
	const original = makeFile("Notes/Note.md");
	const conflictA = makeConflictFile({
		filename: "Note",
		date: "20210101",
		time: "000000",
		modifiedBy: "AAAAAAA",
	});
	const conflictB = makeConflictFile({
		filename: "Note",
		date: "20220101",
		time: "000000",
		modifiedBy: "BBBBBBB",
	});

	it("groups conflicts by original filename, most recent first", async () => {
		const { controller } = makeHarness([
			original,
			conflictA,
			conflictB,
		]);

		const result = await controller.getConflicts();

		expect(result).toBeInstanceOf(Map);
		if (!(result instanceof Map)) return;
		expect([...result.keys()]).toEqual(["Note"]);
		expect(result.get("Note")).toEqual([conflictB, conflictA]);
	});

	it("returns an empty map when there is no conflict", async () => {
		const { controller } = makeHarness([original]);

		const result = await controller.getConflicts();

		expect(result).toBeInstanceOf(Map);
		if (!(result instanceof Map)) return;
		expect(result.size).toBe(0);
	});

	it("returns a Failure when a conflict filename cannot be parsed", async () => {
		const { controller } = makeHarness([
			makeFile("bad.sync-conflict-x.md"),
		]);

		const result = await controller.getConflicts();

		expect(result).toBeInstanceOf(Failure);
	});
});

describe("SyncthingController.getDiffFiles", () => {
	const original = makeFile("Notes/Note.md");
	const conflictA = makeConflictFile({
		filename: "Note",
		date: "20210101",
		time: "000000",
		modifiedBy: "AAAAAAA",
	});
	const conflictB = makeConflictFile({
		filename: "Note",
		date: "20220101",
		time: "000000",
		modifiedBy: "BBBBBBB",
	});
	const other = makeFile("Other.md");

	it("resolves the original file and the conflicting files", async () => {
		const { controller } = makeHarness([
			original,
			conflictA,
			conflictB,
			other,
		]);

		const result = await controller.getDiffFiles(conflictA);

		expect(result.originalFile).toBe(original);
		expect(result.conflictingFiles).toEqual([conflictA, conflictB]);
		expect(result.conflictingFilesProperties.size).toBe(2);
	});

	it("returns a Failure for a file that is not a conflict", async () => {
		const { controller } = makeHarness([original, other]);

		const result = await controller.getDiffFiles(other);

		expect(result.originalFile).toBe(other);
		expect(result.conflictingFiles).toBeInstanceOf(Failure);
		expect(result.conflictingFilesProperties.get(other)).toBeInstanceOf(
			Failure,
		);
	});
});

describe("SyncthingController.getAPIKey", () => {
	it("returns a Failure on mobile", async () => {
		Platform.isMobileApp = true;
		const { controller } = makeHarness();

		const result = await controller.getAPIKey();

		expect(result).toBeInstanceOf(Failure);
		expect((result as Failure).message).toContain("mobile");
	});

	it("returns the existing key without calling the CLI", async () => {
		const { controller, cli } = makeHarness([], { api_key: "existing" });

		await expect(controller.getAPIKey()).resolves.toBe("existing");
		expect(cli.getAPIkey).not.toHaveBeenCalled();
	});

	it("asks the CLI and persists the key when none is set", async () => {
		const { controller, cli, plugin } = makeHarness([], { api_key: "" });
		cli.getAPIkey.mockResolvedValue("new-key");

		await expect(controller.getAPIKey()).resolves.toBe("new-key");
		expect(plugin.settings.api_key).toBe("new-key");
		expect(plugin.saveSettings).toHaveBeenCalled();
	});

	it("does not persist an empty key returned by the CLI", async () => {
		const { controller, cli, plugin } = makeHarness([], { api_key: "" });
		cli.getAPIkey.mockResolvedValue("");

		await expect(controller.getAPIKey()).resolves.toBe("");
		expect(plugin.saveSettings).not.toHaveBeenCalled();
	});

	it("returns a CliFailure when the CLI throws", async () => {
		const { controller, cli } = makeHarness([], { api_key: "" });
		cli.getAPIkey.mockRejectedValue(new Error("boom"));

		await expect(controller.getAPIKey()).resolves.toBeInstanceOf(CliFailure);
	});
});

describe("SyncthingController.getConfiguration", () => {
	it("fails when Syncthing is not running", async () => {
		const { controller, rest } = makeHarness();
		rest.ping.mockRejectedValue(new Error("offline"));

		const result = await controller.getConfiguration();

		expect(result).toBeInstanceOf(Failure);
	});

	it("returns the REST configuration when available", async () => {
		const { controller, rest } = makeHarness();
		rest.ping.mockResolvedValue("pong");
		rest.config.all.mockResolvedValue(CONFIG);

		await expect(controller.getConfiguration()).resolves.toBe(CONFIG);
	});

	it("falls back to the CLI when the REST call fails on desktop", async () => {
		const { controller, rest, cli } = makeHarness();
		rest.ping.mockResolvedValue("pong");
		rest.config.all.mockRejectedValue(new Error("rest error"));
		cli.getConfiguration.mockResolvedValue(CONFIG);

		await expect(controller.getConfiguration()).resolves.toBe(CONFIG);
		expect(cli.getConfiguration).toHaveBeenCalled();
	});

	it("returns a RestFailure on mobile when the REST call fails", async () => {
		Platform.isMobileApp = true;
		const { controller, rest, cli } = makeHarness();
		rest.ping.mockResolvedValue("pong");
		rest.config.all.mockRejectedValue(new Error("rest error"));

		const result = await controller.getConfiguration();

		expect(result).toBeInstanceOf(RestFailure);
		expect(cli.getConfiguration).not.toHaveBeenCalled();
	});
});

describe("SyncthingController datasource delegation", () => {
	it("getDevices delegates to the REST datasource", async () => {
		const { controller, rest } = makeHarness();
		const devices = [{ deviceID: "A" }];
		rest.getDevices.mockResolvedValue(devices);

		await expect(controller.getDevices()).resolves.toBe(devices);
	});

	it("getFolders delegates to the REST datasource", async () => {
		const { controller, rest } = makeHarness();
		const folders = [{ id: "default" }];
		rest.getAllFolders.mockResolvedValue(folders);

		await expect(controller.getFolders()).resolves.toBe(folders);
	});

	it("startSyncthing delegates to the CLI datasource", async () => {
		const { controller, cli } = makeHarness();
		cli.startSyncthing.mockResolvedValue(true);

		await expect(controller.startSyncthing()).resolves.toBe(true);
	});

	it("stopSyncthing delegates to the CLI datasource", async () => {
		const { controller, cli } = makeHarness();
		cli.stopSyncthing.mockResolvedValue(true);

		await expect(controller.stopSyncthing()).resolves.toBe(true);
	});
});
