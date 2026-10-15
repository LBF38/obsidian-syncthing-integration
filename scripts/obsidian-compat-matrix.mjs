#!/usr/bin/env node
/**
 * Prints, as a JSON array, the Obsidian versions to sweep in the
 * "Compatibility sweep" workflow (`.github/workflows/compat.yml`).
 *
 * The sweep is used to (re)discover the plugin's real `minAppVersion`: the
 * lowest Obsidian version on which the plugin still runs. Testing one version
 * per minor release (the latest patch of each), from the oldest version that
 * wdio-obsidian-service supports up to the latest stable release, keeps the
 * matrix small while covering every release that could change the plugin API.
 *
 * Usage:
 *   node scripts/obsidian-compat-matrix.mjs              # fetch the canonical list
 *   node scripts/obsidian-compat-matrix.mjs versions.json  # use a local copy
 *   OBSIDIAN_VERSIONS_URL=... node scripts/obsidian-compat-matrix.mjs
 */
import { readFileSync } from "node:fs";
import { minSupportedObsidianVersion } from "wdio-obsidian-service";

const source =
	process.argv[2] ??
	process.env.OBSIDIAN_VERSIONS_URL ??
	"https://raw.githubusercontent.com/jesse-r-s-hines/wdio-obsidian-service/HEAD/obsidian-versions.json";

/** Numeric comparison of `major.minor.patch` versions. */
function compareVersions(a, b) {
	const partsA = a.split(".").map(Number);
	const partsB = b.split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
		if (diff !== 0) return diff;
	}
	return 0;
}

/** Whether the version ships an Obsidian installer for Linux (CI runs on Linux). */
function hasLinuxInstaller(entry) {
	const installers = entry.installers ?? {};
	return Object.values(installers).some((installer) =>
		installer?.platforms?.includes("linux-x64")
	);
}

async function loadVersions() {
	if (source.startsWith("http")) {
		const response = await fetch(source);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${source}: ${response.status}`);
		}
		return response.json();
	}
	return JSON.parse(readFileSync(source, "utf8"));
}

const { versions } = await loadVersions();

// Keep only the latest patch release of each minor version.
const latestPerMinor = new Map();
for (const entry of versions) {
	if (entry.isBeta) continue;
	if (compareVersions(entry.version, minSupportedObsidianVersion) < 0) continue;
	if (!hasLinuxInstaller(entry)) continue;

	const minor = entry.version.split(".").slice(0, 2).join(".");
	const current = latestPerMinor.get(minor);
	if (!current || compareVersions(entry.version, current.version) > 0) {
		latestPerMinor.set(minor, entry);
	}
}

const matrix = [...latestPerMinor.values()]
	.sort((a, b) => compareVersions(a.version, b.version))
	.map((entry) => entry.version);

process.stdout.write(`${JSON.stringify(matrix)}\n`);
