/**
 * Helpers to load JSON fixtures captured from Syncthing API / CLI responses.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FIXTURES_DIR = fileURLToPath(
	new URL("../fixtures/syncthing/", import.meta.url),
);

/**
 * Read a fixture file as a raw string (as returned by `JSON.stringify` or by
 * the Syncthing CLI).
 */
export function readFixture(name: string): string {
	return readFileSync(`${FIXTURES_DIR}${name}`, "utf8");
}

/**
 * Read a fixture file and parse it into a typed object.
 */
export function readFixtureJson<T = unknown>(name: string): T {
	return JSON.parse(readFixture(name)) as T;
}
