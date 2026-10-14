import { browser, expect } from "@wdio/globals";
import { before, describe, it } from "mocha";

const PLUGIN_ID = "syncthing-integration";

const SYNCTHING_URL = process.env.SYNCTHING_URL ?? "http://127.0.0.1:8384";
const SYNCTHING_API_KEY = process.env.SYNCTHING_API_KEY ?? "test-api-key";

function toConfigurationUrl(url: string): {
	protocol: "http" | "https";
	ip_address: string;
	port: number;
} {
	const parsed = new URL(url);
	const protocol = parsed.protocol.replace(/:$/, "");
	return {
		protocol: protocol === "https" ? "https" : "http",
		ip_address: parsed.hostname,
		port: Number(parsed.port || 8384),
	};
}

const configurationUrl = toConfigurationUrl(SYNCTHING_URL);

describe("e2e: the plugin talks to a real Syncthing instance", function () {
	before(async function () {
		// Point the plugin at the Syncthing instance under test and persist the
		// settings, exactly like a user would through the settings tab.
		await browser.executeObsidian(
			async function ({ plugins }, config) {
				const plugin = plugins.syncthingIntegration;
				plugin.settings.api_key = config.apiKey;
				plugin.settings.configuration.url = config.url;
				await plugin.saveSettings();
			},
			{ apiKey: SYNCTHING_API_KEY, url: configurationUrl },
		);
	});

	it("reports that Syncthing is running", async function () {
		const running = await browser.executeObsidian(async function ({ plugins }) {
			return plugins.syncthingIntegration.syncthingController.isRunning();
		});

		expect(running).toBe(true);
	});

	it("pings the Syncthing REST API", async function () {
		const pong = await browser.executeObsidian(async function ({ plugins }) {
			return plugins.syncthingIntegration.syncthingFromREST.ping();
		});

		expect(pong).toBe("pong");
	});

	it("lists the devices configured in Syncthing", async function () {
		const deviceCount = await browser.executeObsidian(async function ({
			plugins,
		}) {
			const devices =
				await plugins.syncthingIntegration.syncthingFromREST.getDevices();
			return devices.length;
		});

		// A running Syncthing instance always knows about at least its own device.
		expect(deviceCount).toBeGreaterThan(0);
	});

	it("fetches the folders without erroring", async function () {
		const folderCount = await browser.executeObsidian(async function ({
			plugins,
		}) {
			const folders =
				await plugins.syncthingIntegration.syncthingFromREST.getAllFolders();
			return folders.length;
		});

		expect(typeof folderCount).toBe("number");
	});

	// This exercises `getConfiguration()` end-to-end. It is currently expected to
	// fail because of a pre-existing bug: the REST datasource passes the object
	// already parsed by `requestUrl` into `fromJSON`, which expects a JSON string.
	// Enable this once that bug is fixed.
	it.skip("loads the full Syncthing configuration", async function () {
		const version = await browser.executeObsidian(async function ({ plugins }) {
			const config =
				await plugins.syncthingIntegration.syncthingFromREST.getConfiguration();
			return config.version;
		});

		expect(version).toBeTruthy();
	});

	it("opens the conflicts modal through a real command", async function () {
		await browser.executeObsidianCommand(
			`${PLUGIN_ID}:syncthing-conflicts-modal`,
		);

		const modal = browser.$(".modal-container .modal-content");
		await expect(modal).toExist();
		await expect(modal).toHaveText(/Project/);

		const closeButton = browser.$(".modal-container .modal-close-button");
		if (await closeButton.isExisting()) {
			await closeButton.click();
		}
	});
});
