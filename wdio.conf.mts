import * as path from "node:path";
import { env } from "node:process";
import {
	obsidianBetaAvailable,
	parseObsidianVersions,
} from "wdio-obsidian-service";

// wdio-obsidian-service downloads the Obsidian versions into this directory.
const cacheDir = path.resolve(".obsidian-cache");

// Only test against the latest stable Obsidian by default. Override with the
// OBSIDIAN_VERSIONS env var, e.g. "OBSIDIAN_VERSIONS='earliest/earliest latest/latest'".
// The plugin targets a low minAppVersion, so "earliest" can be enabled once the
// built plugin is verified to run on it.
let defaultVersions = "latest/latest";
if (await obsidianBetaAvailable({ cacheDir })) {
	defaultVersions += " latest-beta/latest";
}

const versions = await parseObsidianVersions(
	env.OBSIDIAN_VERSIONS ?? defaultVersions,
	{ cacheDir },
);

if (env.CI) {
	// Print the resolved Obsidian versions so the CI workflow can use them as a cache key.
	// See .github/workflows/e2e.yml.
	console.log("obsidian-cache-key:", JSON.stringify(versions));
}

export const config: WebdriverIO.Config = {
	runner: "local",
	framework: "mocha",

	specs: ["./test/specs/**/*.e2e.ts"],

	// Number of Obsidian instances launched in parallel.
	maxInstances: Number(env.WDIO_MAX_INSTANCES || 1),

	capabilities: versions.map<WebdriverIO.Capabilities>(
		([appVersion, installerVersion]) => ({
			browserName: "obsidian",
			"wdio:obsidianOptions": {
				appVersion,
				installerVersion,
				// The plugin is built into "build/" (main.js + manifest.json + styles.css).
				// Build first: `pnpm build`.
				plugins: ["build"],
				vault: "test/vaults/simple",
			},
		}),
	),

	services: ["obsidian"],
	reporters: ["obsidian"],

	mochaOpts: {
		ui: "bdd",
		timeout: 60 * 1000,
	},
	waitforInterval: 250,
	waitforTimeout: 5 * 1000,
	logLevel: "warn",

	cacheDir,

	// Import describe/it/expect explicitly instead of injecting globals.
	injectGlobals: false,
};
