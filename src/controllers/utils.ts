// --- My utility functions --- //

import { TFile } from "obsidian";
import { ConflictFilename } from "src/models/entities";
import { Failure } from "src/models/failures";
import { date, minValue, number, string, transform, union } from "valibot";

/**
 * This utility function is used to sort the files in conflict by date, name, etc.
 * @param files the file map to sort
 * @param type the sort type
 * @returns the sorted file map
 */
export function sortFilesBy(
	files: Map<string, TFile[]>,
	type: "recent" | "old" | "a-to-z" | "z-to-a"
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
	const regex = new RegExp(/(.*).sync-conflict-(\d{8})-(\d{6})-(\w+).(\w+)/);
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

/**
 * Creates a complete, customizable validation function that validates a datetime.
 *
 * The correct number of days in a month is validated, including leap year.
 *
 * Date Format: yyyy-mm-dd
 * Time Formats: [T]hh:mm[:ss[.sss]][+/-hh:mm] or [T]hh:mm[:ss[.sss]][Z]
 *
 * @param {Object} options The configuration options.
 * @param {boolean} options.date Whether to validate the date.
 * @param {boolean} options.time Whether to validate the time.
 * @param {boolean} options.seconds Whether to validate the seconds.
 * @param {boolean} options.milliseconds Whether to validate the milliseconds.
 * @param {boolean} options.timezone Whether to validate the timezone.
 * @param {string} error The error message.
 *
 * @returns A validation function.
 *
 * @copyright [sillvva](https://github.com/sillvva)
 * @see https://github.com/fabian-hiller/valibot/discussions/63
 */
export function iso<TInput extends string>(options?: {
	date?: boolean;
	time?: boolean;
	seconds?: boolean;
	milliseconds?: boolean;
	timezone?: boolean;
	error?: string;
}) {
	return (input: TInput) => {
		// override default date and time options to true if options is undefined
		const {
			date = false,
			time = false,
			seconds = true,
			milliseconds = true,
			timezone = true,
			error = "Invalid ISO string",
		} = options || { date: true, time: true };

		const dateRegex = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
		const timeRegex = `([01]\\d|2[0-3]):[0-5]\\d:${
			seconds ? `[0-5]\\d${milliseconds ? "\\.\\d{3}" : ""}` : ""
		}${timezone ? "([+-]([01]\\d|2[0-3]):[0-5]\\d|Z)" : ""}`;
		const regex = new RegExp(
			`^${date ? dateRegex : ""}${date && time ? "T" : time ? "T?" : ""}${
				time ? timeRegex : ""
			}$`
		);

		if (!regex.test(input)) {
			return {
				issue: {
					validation: "iso",
					message: error,
					input,
				},
			};
		}
		return { output: input };
	};
}

/**
 * Transforms a Date, string, or number into a Date
 *
 *
 */
export const dateSchema = transform(
	// Input types: Date, string, number
	union(
		[
			date(),
			string([iso({ date: true, time: true, milliseconds: false })]),
			number([minValue(0)]),
		],
		"Must be a valid Date object, ISO string, or UNIX timestamp"
	),
	// Output type: Date
	(input) => new Date(input)
);
