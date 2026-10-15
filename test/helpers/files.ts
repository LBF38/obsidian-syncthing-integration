/**
 * Helpers to build Obsidian `TFile`-like objects for tests.
 *
 * The `TFile` class comes from the mocked `obsidian` module (see
 * `test/mocks/obsidian.ts`), so `file instanceof TFile` checks inside the
 * plugin code resolve correctly.
 */
import { TFile, type FileStats, type TFolder, type Vault } from "obsidian";

const FAKE_VAULT = {} as Vault;

export interface MakeFileOptions {
	/** Override the derived file stats. */
	stat?: Partial<FileStats>;
}

/**
 * Build a `TFile` from a path. The `name`, `basename` and `extension` fields
 * are derived the same way Obsidian does.
 */
export function makeFile(path: string, options: MakeFileOptions = {}): TFile {
	const file = new TFile();
	const name = path.split("/").pop() ?? path;
	const lastDot = name.lastIndexOf(".");
	const hasExtension = lastDot > 0 && lastDot < name.length - 1;

	file.path = path;
	file.name = name;
	file.basename = hasExtension ? name.slice(0, lastDot) : name;
	file.extension = hasExtension ? name.slice(lastDot + 1) : "";
	file.parent = null as unknown as TFolder;
	file.vault = FAKE_VAULT;
	file.stat = {
		ctime: 0,
		mtime: 0,
		size: 0,
		...options.stat,
	};

	return file;
}

export interface ConflictParts {
	filename?: string;
	date?: string;
	time?: string;
	modifiedBy?: string;
	extension?: string;
}

/**
 * Build a Syncthing conflict filename following the documented format:
 * `{filename}.sync-conflict-{date}-{time}-{modifiedBy}.{extension}`.
 */
export function conflictName(parts: ConflictParts = {}): string {
	const {
		filename = "Note",
		date = "20210930",
		time = "123456",
		modifiedBy = "ABCDEFG",
		extension = "md",
	} = parts;
	return `${filename}.sync-conflict-${date}-${time}-${modifiedBy}.${extension}`;
}

/**
 * Build a `TFile` whose name follows the Syncthing conflict filename format.
 */
export function makeConflictFile(parts: ConflictParts = {}): TFile {
	const name = conflictName(parts);
	return makeFile(name);
}
