/**
 * Sanity checks for the test harness itself: the `obsidian` module alias, the
 * prototype polyfills and the fixture loader. These guard the infrastructure
 * that every other test relies on.
 */
import { describe, expect, it } from "vitest";
import { TFile } from "obsidian";
import { makeFile } from "./helpers/files";
import { readFixtureJson } from "./helpers/fixtures";

describe("test infrastructure", () => {
	it("installs the Obsidian String#contains extension", () => {
		expect("hello.sync-conflict".contains(".sync-conflict")).toBe(true);
		expect("hello".contains(".sync-conflict")).toBe(false);
	});

	it("installs the Obsidian Array#remove extension", () => {
		const values = [1, 2, 3, 2];
		values.remove(2);
		expect(values).toEqual([1, 3, 2]);
	});

	it("resolves `obsidian` to the runtime mock", () => {
		const file = makeFile("folder/Note.md");
		expect(file).toBeInstanceOf(TFile);
		expect(file.name).toBe("Note.md");
		expect(file.basename).toBe("Note");
		expect(file.extension).toBe("md");
	});

	it("loads JSON fixtures", () => {
		const config = readFixtureJson<{ version: string }>("config.json");
		expect(config.version).toBe("37");
	});
});
