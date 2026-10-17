import { readFileSync, writeFileSync } from "fs";
import { minSupportedObsidianVersion } from "wdio-obsidian-service";

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/** Numeric comparison of `major.minor.patch` versions. */
function compareVersions(a, b) {
	const partsA = a.split(".").map(Number);
	const partsB = b.split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
		if (diff !== 0) return Math.sign(diff);
	}
	return 0;
}

// semantic-release passes the next version to scripts/prepareRelease.sh, which
// runs `pnpm run version`. Fall back to the npm-provided env var so the script
// also works when invoked directly through a package.json script.
const targetVersion = process.argv[2] ?? process.env.npm_package_version;
if (!targetVersion || !SEMVER_PATTERN.test(targetVersion)) {
	console.error(`Invalid or missing target version: "${targetVersion}"`);
	process.exit(1);
}

// read minAppVersion from manifest.json and bump version to target version
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;

if (!SEMVER_PATTERN.test(minAppVersion)) {
	console.error(
		`manifest.json has an invalid minAppVersion: "${minAppVersion}"`,
	);
	process.exit(1);
}
if (compareVersions(minAppVersion, minSupportedObsidianVersion) < 0) {
	console.warn(
		`WARNING: minAppVersion ${minAppVersion} is below ${minSupportedObsidianVersion}, ` +
			`the oldest Obsidian version the e2e tests can verify. This release would ` +
			`claim support for versions we cannot test. Run the "Compatibility sweep" ` +
			`workflow (.github/workflows/compat.yml) and set minAppVersion in ` +
			`manifest.json to the lowest version that passes.`,
	);
}

manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// update versions.json with target version and minAppVersion from manifest.json
const versions = JSON.parse(readFileSync("versions.json", "utf8"));
if (versions[targetVersion] && versions[targetVersion] !== minAppVersion) {
	console.warn(
		`versions.json already maps ${targetVersion} to ${versions[targetVersion]}; ` +
			`overwriting it with ${minAppVersion}.`,
	);
}
versions[targetVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));

console.log(
	`Recorded release ${targetVersion} (minAppVersion ${minAppVersion}) in manifest.json and versions.json.`,
);
