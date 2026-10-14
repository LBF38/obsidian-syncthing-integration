import { createRequire } from "node:module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Platform } from "obsidian";
import { CliFailure } from "src/models/failures";
import { SyncthingConfigurationModel } from "../models/models";
import { readFixture } from "../../test/helpers/fixtures";
import { SyncthingFromCLI } from "./syncthing_local_datasource";

/**
 * The datasource uses `require("util").promisify` internally. Inside Vitest the
 * `require` is resolved by Node's module system, so we patch `promisify` on the
 * real `util` module (shared with the code under test) instead of stubbing the
 * global `require`.
 */
const nodeRequire = createRequire(import.meta.url);
const util = nodeRequire("util") as typeof import("util");

let stdout: string;
let stderr: string;
let statIsDirectory: boolean;
let execError: Error | undefined;
let lastCommand: string | undefined;
let lastStatPath: string | undefined;
let cli: SyncthingFromCLI;

beforeEach(() => {
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
	stdout = "";
	stderr = "";
	statIsDirectory = true;
	execError = undefined;
	lastCommand = undefined;
	lastStatPath = undefined;

	vi.spyOn(util, "promisify").mockImplementation(((
		fn: (...args: unknown[]) => unknown,
	) => {
		if (fn.name === "stat") {
			return (path: string): Promise<unknown> => {
				lastStatPath = path;
				if (execError) return Promise.reject(execError);
				return Promise.resolve({
					isDirectory: () => statIsDirectory,
				});
			};
		}
		return (command: string): Promise<unknown> => {
			lastCommand = command;
			if (execError) return Promise.reject(execError);
			return Promise.resolve({ stdout, stderr });
		};
	}) as never);

	cli = new SyncthingFromCLI();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("SyncthingFromCLI.getVersion", () => {
	it("returns the CLI output", async () => {
		stdout = "syncthing v1.27.0\n";

		await expect(cli.getVersion()).resolves.toBe("syncthing v1.27.0\n");
		expect(lastCommand).toBe("syncthing --version");
	});

	it("throws a CliFailure when the command writes to stderr", async () => {
		stderr = "syncthing: not found";

		await expect(cli.getVersion()).rejects.toBeInstanceOf(CliFailure);
		await expect(cli.getVersion()).rejects.toThrow("syncthing: not found");
	});

	it("rejects when the command itself fails to run", async () => {
		execError = new Error("spawn failed");

		await expect(cli.getVersion()).rejects.toThrow("spawn failed");
	});

	it("throws a CliFailure when running on mobile", async () => {
		Platform.isMobileApp = true;

		await expect(cli.getVersion()).rejects.toThrow(
			"CLI not supported on mobile.",
		);
	});

	it("uses the macOS application package when available", async () => {
		Platform.isMacOS = true;

		await cli.getVersion();

		expect(lastStatPath).toBe(
			"/Applications/Syncthing.app/Contents/Resources/syncthing/",
		);
		expect(lastCommand).toBe(
			"/Applications/Syncthing.app/Contents/Resources/syncthing/syncthing --version",
		);
	});

	it("ignores the macOS package when it is not a directory", async () => {
		Platform.isMacOS = true;
		statIsDirectory = false;

		await cli.getVersion();

		expect(lastCommand).toBe("syncthing --version");
	});
});

describe("SyncthingFromCLI.getConfiguration", () => {
	it("parses the configuration returned by the CLI", async () => {
		stdout = readFixture("config.json");

		const config = await cli.getConfiguration();

		expect(config).toBeInstanceOf(SyncthingConfigurationModel);
		expect(config.version).toBe("37");
		expect(config.folders).toHaveLength(2);
		expect(lastCommand).toBe("syncthing cli config dump-json");
	});
});

describe("SyncthingFromCLI.getAPIkey", () => {
	it("returns the trimmed API key", async () => {
		stdout = "  my-api-key\n";

		await expect(cli.getAPIkey()).resolves.toBe("my-api-key");
	});

	it("throws a CliFailure when the command fails", async () => {
		stderr = "no key";

		await expect(cli.getAPIkey()).rejects.toThrow("No API key found.");
	});
});

describe("SyncthingFromCLI start / stop", () => {
	it("startSyncthing resolves to true", async () => {
		await expect(cli.startSyncthing()).resolves.toBe(true);
	});

	it("startSyncthing throws a CliFailure when the command fails", async () => {
		stderr = "already running";

		await expect(cli.startSyncthing()).rejects.toBeInstanceOf(CliFailure);
	});

	it("stopSyncthing resolves to true", async () => {
		await expect(cli.stopSyncthing()).resolves.toBe(true);
	});
});
