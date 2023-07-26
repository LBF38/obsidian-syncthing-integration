// --- My utility functions --- //

import { TFile } from "obsidian";
import { Failure } from "src/models/failures";
import { SyncthingController } from "./main_controller";

/**
 * This utility function is used to sort the files in conflict by date, name, etc.
 * @param files the file map to sort
 * @param type the sort type
 * @param syncthingController the Syncthing controller instance
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
					sortByConflictDate(a[1], b[1], syncthingController)
				)
			);
		case "old":
			return new Map(
				[...files.entries()]
					.sort((a, b) =>
						sortByConflictDate(a[1], b[1], syncthingController)
					)
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
 * It uses {@link SyncthingController.parseConflictFilename} from the Syncthing controller.
 *
 * TODO: refactor the `parseConflictFilename` method to a utility function.
 * @param a file A to compare
 * @param b file B to compare
 * @param syncthingController the Syncthing controller instance
 */
export function sortByConflictDate(
	a: TFile,
	b: TFile,
	syncthingController: SyncthingController
): number;

/**
 * Compares two lists of files by conflict date.
 * It uses {@link SyncthingController.parseConflictFilename} from the Syncthing controller.
 *
 * TODO: refactor the `parseConflictFilename` method to a utility function.
 * @param a list of files to compare
 * @param b list of files to compare
 * @param syncthingController the Syncthing controller instance
 */
export function sortByConflictDate(
	a: TFile[],
	b: TFile[],
	syncthingController: SyncthingController
): number;

export function sortByConflictDate(
	a: TFile | TFile[],
	b: TFile | TFile[],
	syncthingController: SyncthingController
): number {
	if (a instanceof TFile && b instanceof TFile) {
		const filepropsA = syncthingController.parseConflictFilename(
			a.basename
		);

		const filepropsB = syncthingController.parseConflictFilename(
			b.basename
		);
		const dateA =
			filepropsA instanceof Failure ? new Date() : filepropsA.dateTime;
		const dateB =
			filepropsB instanceof Failure ? new Date() : filepropsB.dateTime;
		return dateB.getTime() - dateA.getTime();
	}
	// The `as` typing is because TypeScript doesn't seem to understand that we are left with the TFile[] type
	const fileA = (a as TFile[]).sort((a, b) =>
		sortByConflictDate(a, b, syncthingController)
	)[0];
	const fileB = (b as TFile[]).sort((a, b) =>
		sortByConflictDate(a, b, syncthingController)
	)[0];
	return sortByConflictDate(fileA, fileB, syncthingController);
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
