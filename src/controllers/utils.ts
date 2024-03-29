// --- My utility functions --- //

import { TFile } from "obsidian";
import { Failure } from "src/models/failures";
import { SyncthingController } from "./main_controller";
import { ConflictFilename } from "src/models/entities";

/**
 * This utility function is used to sort the files in conflict by date, name, etc.
 * @param files the file map to sort
 * @param type the sort type
 * @returns the sorted file map
 */
export function sortFilesBy(
	files: Map<string, TFile[]>,
	type: "recent" | "old" | "a-to-z" | "z-to-a",
	syncthingController: SyncthingController
): Map<string, TFile[]> {
	switch (type) {
		case "recent":
			return new Map(
				[...files.entries()].sort((a, b) =>
					sortByConflictDate(a[1], b[1])
				)
			);
		case "old":
			return new Map(
				[...files.entries()]
					.sort((a, b) => sortByConflictDate(a[1], b[1]))
					.reverse()
			);
		case "a-to-z":
			return new Map([...files.entries()].sort());
		case "z-to-a":
			return new Map([...files.entries()].sort().reverse());
	}
}

/**
 * Compares two files by conflict date.
 * It uses {@link parseConflictFilename} utility function.
 *
 * @param a file A to compare
 * @param b file B to compare
 */
export function sortByConflictDate(a: TFile, b: TFile): number;

/**
 * Compares two lists of files by conflict date.
 * It uses {@link parseConflictFilename} utility function.
 *
 * @param a list of files to compare
 * @param b list of files to compare
 */
export function sortByConflictDate(a: TFile[], b: TFile[]): number;

export function sortByConflictDate(
	a: TFile | TFile[],
	b: TFile | TFile[]
): number {
	if (a instanceof TFile && b instanceof TFile) {
		const filepropsA = parseConflictFilename(a.basename);
		const filepropsB = parseConflictFilename(b.basename);
		const dateA =
			filepropsA instanceof Failure ? new Date() : filepropsA.dateTime;
		const dateB =
			filepropsB instanceof Failure ? new Date() : filepropsB.dateTime;
		return dateB.getTime() - dateA.getTime();
	}
	// The `as` typing is because TypeScript doesn't seem to understand that we are left with the TFile[] type
	const fileA = (a as TFile[]).sort((a, b) => sortByConflictDate(a, b))[0];
	const fileB = (b as TFile[]).sort((a, b) => sortByConflictDate(a, b))[0];
	return sortByConflictDate(fileA, fileB);
}


const SYNCTHING_CONFLICT_FILENAME_REGEX = /(.*).sync-conflict-(\d{8})-(\d{6})-(\w+).(\w+)/;

/**
 * Parses a Syncthing conflict filename.
 * The filename format is as follow : `{filename}.sync-conflict-{date}-{time}-{modifiedBy}.{extension}`
 * The format of each part is as follow :
 * - `{filename}` : the filename of the file that is in conflict.
 * - `{date}` : the date of the conflict, in the format `YYYYMMDD`.
 * - `{time}` : the time of the conflict, in the format `HHMMSS`.
 * - `{modifiedBy}` : the device ID of the device that modified the file. it is a reduced version of {@linkcode SyncthingDevice.deviceID}
 * - `{extension}` : the file extension of the file that is in conflict.
 * @param filename the filename to parse.
 * @see https://docs.syncthing.net/users/syncing.html#conflicting-changes for the filename format.
 * @returns a {@linkcode ConflictFilename} object if the filename is valid, or a {@linkcode Failure} object if it is not.
 */
export function parseConflictFilename(
	filename: string
): ConflictFilename | Failure {
	const regex = new RegExp(SYNCTHING_CONFLICT_FILENAME_REGEX);
	const match = regex.exec(filename);
	if (!match) {
		return new Failure(`Error parsing conflict filename : ${filename}`);
	}
	return {
		filename: match[1],
		date: match[2],
		time: match[3],
		dateTime: new Date(
			`${match[2].slice(0, 4)}-${match[2].slice(4, 6)}-${match[2].slice(
				6,
				8
			)}T${match[3].slice(0, 2)}:${match[3].slice(2, 4)}:${match[3].slice(
				4,
				6
			)}`
		),
		modifiedBy: match[4],
		extension: match[5],
	};
}

/**
 * Check if the given filename is in the format of a Syncthing conflict like `{filename}.sync-conflict-{date}-{time}-{modifiedBy}.{extension}`.
 *
 * @param filename The filename to check.
 */
export function isConflictFilename(filename: string): boolean {
	const regex = new RegExp(SYNCTHING_CONFLICT_FILENAME_REGEX);
	const match = regex.exec(filename);
	return !!match;
}

/**
 * This utility function allows to correctly format the file size w/ a unit.
 * @param bytes file size to format
 * @param decimals number of decimals to display
 * @returns string with formatted file size
 *
 *
 * Credits for the `formatBytes` function:
 * @see https://github.com/CattailNu/obsidian-file-info-panel-plugin
 *
 * obsidian-file-info-panel-plugin
 *
 * @copyright T. L. Ford
 * @see https://www.Cattail.Nu
 */
export function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function isArrayOf<T>(
	value: unknown,
	typeGuard: (value: unknown) => value is T
): value is T[] {
	if (!Array.isArray(value)) {
		return false;
	}
	for (const item of value) {
		if (!typeGuard(item)) {
			return false;
		}
	}
	return true;
}

export function isStringArray(value: unknown): value is string[] {
	return isArrayOf(value, (item): item is string => typeof item === "string");
}

export function isNumberArray(value: unknown): value is number[] {
	return isArrayOf(value, (item): item is number => typeof item === "number");
}

// /**
//  * Validates that a JSON object has the expected fields and types.
//  * @param json The JSON object to validate.
//  * @param field A field to validate.
//  * @param type The type of the field.
//  * @returns `true` if the JSON object is valid, `false` otherwise.
//  */
// export function validateField(
// 	json: unknown,
// 	field: string,
// 	type: "string" | "number" | "boolean" | "object" | "array"
// ): json is object & Record<typeof field, typeof type> {
// 	if (typeof json !== "object" || json === null) {
// 		return false;
// 	}
// 	for (const [key, type] of Object.entries(fields)) {
// 		if (!json.hasOwnProperty(key)) {
// 			return false;
// 		}
// 		if (typeof json[key as keyof typeof json] !== typeof type) {
// 			return false;
// 		}
// 	}
// 	return true;
// }

// let json: unknown = { test: 42 };
// validateJSON(json, { test: 42 });
// json;

/**
 * Validates that a JSON object has the expected field and type.
 *
 * @param json an unknown json response to validate
 * @param field a field to validate in the json response
 * @param type the type of the field to validate
 * @returns `true` if the JSON object is valid, `false` otherwise. And gives the json object the correct type.
 *
 * @example
 * ```ts
 * const json: unknown = { test: 42 };
 * if (!validateField(json, "test", "")) throw new Error("Type error");
 * json; // should be of type `object & Record<"test", string>`
 * ```
 *
 */
export function validateJsonField<T extends string, K>(
	json: unknown,
	field: T,
	type: K
): json is object & Record<T, K> {
	return (
		typeof json === "object" &&
		json !== null &&
		field in json &&
		typeof json[field as keyof typeof json] === type
	);
}

export function logErrorIfNotValidJson<T extends string, K>(
	json: unknown,
	field: T,
	type: K
): asserts json is object & Record<T, K> {
	if (!validateJsonField(json, field, type)) {
		console.error(
			`Error validating JSON: ${field} is not present or is not of type ${typeof type}. Got ${JSON.stringify(
				json
			)}.`
		);
	}
}
// export function throwIfNotValid<T extends string>(
// 	json: unknown,
// 	field: T,
// 	type: "string" | "number" | "boolean" | "object"
// ): asserts json is object & Record<T, typeof checkedType> {
// 	let checkedType;
// 	if (type === "string") checkedType = "";
// 	else if (type === "number") checkedType = 42;
// 	else if (type === "boolean") checkedType = true;
// 	else if (type === "object") checkedType = {};
// 	if (!validateField(json, field, checkedType)) {
// 		throw new Error(
// 			`Error validating JSON: ${field} is not present or is not of type ${typeof type}. Got ${json}.`
// 		);
// 	}
// }
