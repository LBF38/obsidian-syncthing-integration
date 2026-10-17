import { browser, expect } from "@wdio/globals";
import { afterEach, describe, it } from "mocha";

const PLUGIN_ID = "syncthing-integration";

interface AppInternals {
	plugins: { enabledPlugins: Set<string> };
	commands: { commands: Record<string, unknown> };
}

afterEach(async function () {
	// Make sure each test starts from a clean slate without an open modal.
	const closeButton = browser.$(".modal-container .modal-close-button");
	if (await closeButton.isExisting()) {
		await closeButton.click();
	}
});

describe("smoke: the plugin loads inside a real Obsidian instance", function () {
	it("enables the plugin", async function () {
		const enabled = await browser.executeObsidian(function ({ app }, pluginId) {
			const internals = app as unknown as AppInternals;
			return internals.plugins.enabledPlugins.has(pluginId);
		}, PLUGIN_ID);

		expect(enabled).toBe(true);
	});

	it("registers its commands", async function () {
		const commandIds = await browser.executeObsidian(function ({ app }, prefix) {
			const internals = app as unknown as AppInternals;
			return Object.keys(internals.commands.commands).filter((id) =>
				id.startsWith(prefix),
			);
		}, `${PLUGIN_ID}:`);

		expect(commandIds).toContain(`${PLUGIN_ID}:syncthing-conflicts-modal`);
		expect(commandIds).toContain(`${PLUGIN_ID}:syncthing-configuration-modal`);
		expect(commandIds).toContain(`${PLUGIN_ID}:syncthing-diff-modal`);
	});

	it("adds a ribbon icon to open the conflict manager", async function () {
		const ribbon = browser.$(
			'.side-dock-ribbon-action[aria-label="Open Syncthing conflict manager modal"]',
		);
		await expect(ribbon).toExist();
	});

	it("detects conflicting files in the vault through the plugin controller", async function () {
		const conflictCount = await browser.executeObsidian(async function ({
			plugins,
		}) {
			const conflicts =
				await plugins.syncthingIntegration.syncthingController.getConflicts();
			return conflicts instanceof Map ? conflicts.size : -1;
		});

		expect(conflictCount).toBeGreaterThan(0);
	});

	it("opens the conflicts modal and lists the conflicting note", async function () {
		await browser.executeObsidianCommand(
			`${PLUGIN_ID}:syncthing-conflicts-modal`,
		);

		const modal = browser.$(".modal-container .modal-content");
		await expect(modal).toExist();
		await expect(modal).toHaveText(/Project/);
	});
});
