import { readFileSync } from "node:fs";
import * as path from "node:path";
import { env } from "node:process";
import {
	minSupportedObsidianVersion,
	obsidianBetaAvailable,
	parseObsidianVersions,
} from "wdio-obsidian-service";

// wdio-obsidian-service downloads the Obsidian versions into this directory.
const cacheDir = path.resolve(".obsidian-cache");

/** Numeric comparison of `major.minor.patch` versions. */
function compareObsidianVersions(a: string, b: string): number {
	const partsA = a.split(".").map(Number);
	const partsB = b.split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
		if (diff !== 0) return Math.sign(diff);
	}
	return 0;
}

// `manifest.json`'s minAppVersion is the compatibility floor promised by the
// plugin (and recorded per release in versions.json). Test it on every PR,
// together with the latest Obsidian, so a regression on the oldest supported
// version fails the build. Override with the OBSIDIAN_VERSIONS env var, e.g.
// OBSIDIAN_VERSIONS="1.4.16/latest latest/latest".
const declaredMinAppVersion: string = JSON.parse(
	readFileSync("manifest.json", "utf8"),
).minAppVersion;

// wdio-obsidian-service cannot test Obsidian versions older than this. If the
// declared floor is below it, fall back to the oldest testable version and warn
// so the floor gets fixed. The "Compatibility sweep" workflow
// (.github/workflows/compat.yml) finds the real minimum.
let floorVersion = declaredMinAppVersion;
if (
	compareObsidianVersions(declaredMinAppVersion, minSupportedObsidianVersion) <
	0
) {
	console.warn(
		`WARNING: manifest.json declares minAppVersion ${declaredMinAppVersion}, ` +
			`but wdio-obsidian-service cannot test below ${minSupportedObsidianVersion}. ` +
			`Testing ${minSupportedObsidianVersion} instead. Run the "Compatibility sweep" ` +
			`workflow and set minAppVersion to the lowest version that passes.`,
	);
	floorVersion = minSupportedObsidianVersion;
}

let defaultVersions = `${floorVersion}/latest latest/latest`;
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
