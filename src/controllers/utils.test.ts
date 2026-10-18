import { describe, expect, it } from "vitest";
import type { TFile } from "obsidian";
import { safeParse, string } from "valibot";
import { Failure } from "src/models/failures";
import { makeConflictFile, makeFile } from "../../test/helpers/files";
import {
	dateSchema,
	formatBytes,
	iso,
	isConflictFilename,
	parseConflictFilename,
	sortByConflictDate,
	sortFilesBy,
} from "./utils";

describe("isConflictFilename", () => {
	it("returns true for a well-formed conflict filename", () => {
		expect(
			isConflictFilename(
				"Note.sync-conflict-20210930-123456-ABCDEFG.md",
			),
		).toBe(true);
	});

	it("returns true when the pattern appears as a substring", () => {
		expect(
			isConflictFilename(
				"prefix Note.sync-conflict-20210930-123456-ABCDEFG.md suffix",
			),
		).toBe(true);
	});

	it("returns false for a regular filename", () => {
		expect(isConflictFilename("Note.md")).toBe(false);
	});

	it("returns false when parts are missing", () => {
		expect(isConflictFilename("Note.sync-conflict.md")).toBe(false);
		expect(isConflictFilename("Note.sync-conflict-20210930.md")).toBe(false);
	});
});

describe("parseConflictFilename", () => {
	it("parses all parts of a valid conflict filename", () => {
		const parsed = parseConflictFilename(
			"Note.sync-conflict-20210930-123456-ABCDEFG.md",
		);
		expect(parsed).not.toBeInstanceOf(Failure);
		if (parsed instanceof Failure) return;

		expect(parsed.filename).toBe("Note");
		expect(parsed.date).toBe("20210930");
		expect(parsed.time).toBe("123456");
		expect(parsed.modifiedBy).toBe("ABCDEFG");
		expect(parsed.extension).toBe("md");
		// `dateTime` is built in local time, so assert on local getters to keep
		// the test independent of the machine timezone.
		expect(parsed.dateTime.getFullYear()).toBe(2021);
		expect(parsed.dateTime.getMonth()).toBe(8);
		expect(parsed.dateTime.getDate()).toBe(30);
		expect(parsed.dateTime.getHours()).toBe(12);
		expect(parsed.dateTime.getMinutes()).toBe(34);
		expect(parsed.dateTime.getSeconds()).toBe(56);
	});

	it("keeps dots in the original filename", () => {
		const parsed = parseConflictFilename(
			"My.File.sync-conflict-20210930-123456-ABCDEFG.md",
		);
		if (parsed instanceof Failure) throw new Error("should have parsed");
		expect(parsed.filename).toBe("My.File");
	});

	it("returns a Failure for an invalid filename", () => {
		const parsed = parseConflictFilename("Note.md");
		expect(parsed).toBeInstanceOf(Failure);
		if (!(parsed instanceof Failure)) return;
		expect(parsed.message).toContain("Note.md");
	});
});

describe("formatBytes", () => {
	it("formats zero", () => {
		expect(formatBytes(0)).toBe("0 Bytes");
	});

	it("formats bytes below the first unit", () => {
		expect(formatBytes(1000)).toBe("1000 Bytes");
	});

	it("formats kilobytes", () => {
		expect(formatBytes(1024)).toBe("1 KB");
		expect(formatBytes(1536)).toBe("1.5 KB");
	});

	it("formats megabytes and larger units", () => {
		expect(formatBytes(1024 ** 2)).toBe("1 MB");
		expect(formatBytes(1024 ** 3)).toBe("1 GB");
	});

	it("honours the decimals argument", () => {
		expect(formatBytes(1536, 0)).toBe("2 KB");
		expect(formatBytes(1536, 3)).toBe("1.5 KB");
	});

	it("treats negative decimals as zero", () => {
		expect(formatBytes(1536, -1)).toBe("2 KB");
	});
});

describe("iso", () => {
	const isoString = string([iso({ date: true, time: true })]);

	it("accepts a valid ISO date-time", () => {
		expect(safeParse(isoString, "2024-01-01T12:30:00Z").success).toBe(true);
	});

	it("accepts fractional seconds and an explicit offset", () => {
		expect(
			safeParse(isoString, "2024-01-01T12:30:00.123456789+02:00").success,
		).toBe(true);
	});

	it("rejects an invalid calendar date", () => {
		expect(safeParse(isoString, "2024-13-01T00:00:00Z").success).toBe(false);
		expect(safeParse(isoString, "2023-02-29T00:00:00Z").success).toBe(false);
	});

	it("rejects a non-ISO string", () => {
		expect(safeParse(isoString, "not-a-date").success).toBe(false);
	});
});

describe("dateSchema", () => {
	it("transforms an ISO string into a Date", () => {
		const result = safeParse(dateSchema, "2024-01-01T00:00:00Z");
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output).toBeInstanceOf(Date);
	});

	it("transforms a UNIX timestamp into a Date", () => {
		const result = safeParse(dateSchema, 0);
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output).toBeInstanceOf(Date);
	});

	it("passes an existing Date through", () => {
		const date = new Date();
		const result = safeParse(dateSchema, date);
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.getTime()).toBe(date.getTime());
	});

	it("rejects a negative timestamp and an invalid string", () => {
		expect(safeParse(dateSchema, -1).success).toBe(false);
		expect(safeParse(dateSchema, "yesterday").success).toBe(false);
	});
});

describe("sortByConflictDate", () => {
	it("orders two files from most recent to oldest", () => {
		const older = makeConflictFile({
			date: "20210101",
			time: "000000",
		});
		const newer = makeConflictFile({
			date: "20220101",
			time: "000000",
		});
		expect(sortByConflictDate(older, newer)).toBeGreaterThan(0);
		expect(sortByConflictDate(newer, older)).toBeLessThan(0);
	});

	it("orders two lists of files by their most recent conflict", () => {
		const older = makeConflictFile({ date: "20210101", time: "000000" });
		const newer = makeConflictFile({ date: "20220101", time: "000000" });
		expect(sortByConflictDate([older], [newer])).toBeGreaterThan(0);
		expect(sortByConflictDate([newer], [older])).toBeLessThan(0);
	});

	it("falls back to the current date for non-conflict files", () => {
		const plain = makeFile("Note.md");
		const conflict = makeConflictFile({ date: "20200101", time: "000000" });
		expect(sortByConflictDate(plain, conflict)).toBeLessThan(0);
		expect(sortByConflictDate(conflict, plain)).toBeGreaterThan(0);
	});
});

describe("sortFilesBy", () => {
	const a = makeConflictFile({ filename: "A", date: "20210101", time: "000000" });
	const b = makeConflictFile({ filename: "B", date: "20220101", time: "000000" });
	const c = makeConflictFile({ filename: "C", date: "20230101", time: "000000" });

	function makeMap(): Map<string, TFile[]> {
		return new Map<string, TFile[]>([
			["B", [b]],
			["A", [a]],
			["C", [c]],
		]);
	}

	it("sorts by most recent conflict", () => {
		expect([...sortFilesBy(makeMap(), "recent").keys()]).toEqual([
			"C",
			"B",
			"A",
		]);
	});

	it("sorts by least recent conflict", () => {
		expect([...sortFilesBy(makeMap(), "old").keys()]).toEqual([
			"A",
			"B",
			"C",
		]);
	});

	it("sorts alphabetically", () => {
		expect([...sortFilesBy(makeMap(), "a-to-z").keys()]).toEqual([
			"A",
			"B",
			"C",
		]);
	});

	it("sorts in reverse alphabetical order", () => {
		expect([...sortFilesBy(makeMap(), "z-to-a").keys()]).toEqual([
			"C",
			"B",
			"A",
		]);
	});
});
