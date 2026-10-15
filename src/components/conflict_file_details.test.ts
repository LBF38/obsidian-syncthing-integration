// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { mount, unmount } from "svelte";
import type { ConflictParts } from "../../test/helpers/files";
import { makeConflictFile, makeFile } from "../../test/helpers/files";
import ConflictFileDetails from "./conflict_file_details.svelte";

afterEach(cleanup);

function conflictFile(overrides: ConflictParts = {}) {
	return makeConflictFile({
		filename: "Note",
		date: "20210930",
		time: "123456",
		modifiedBy: "ABCDEFG",
		...overrides,
	});
}

describe("conflict_file_details.svelte", () => {
	it("renders the conflict details", () => {
		const file = conflictFile();

		const { container } = render(ConflictFileDetails, {
			props: { file, counter: 0 },
		});

		expect(container.textContent).toContain("Conflict #0");
		expect(container.textContent).toContain("Modified by:");
		expect(container.textContent).toContain("ABCDEFG");
		expect(container.textContent).toContain("Extension:");
		expect(container.textContent).toContain("md");
	});

	it("renders an error for a non-conflict file", () => {
		const file = makeFile("Note.md");

		const { container } = render(ConflictFileDetails, {
			props: { file, counter: 0 },
		});

		expect(container.textContent).toContain("A failure occured");
		expect(container.textContent).not.toContain("Conflict #0");
	});

	it("emits a `file` event when a styled item is clicked", async () => {
		const file = conflictFile();
		const target = document.createElement("div");
		document.body.appendChild(target);
		const handler = vi.fn();

		const component = mount(ConflictFileDetails, {
			target,
			props: { file, counter: 0, styled: true },
			events: { file: handler },
		});

		await fireEvent.click(target.firstElementChild as HTMLElement);

		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler.mock.calls[0][0].detail).toEqual({ file });

		void unmount(component);
		target.remove();
	});

	it("does not emit when the item is not styled", async () => {
		const file = conflictFile();
		const target = document.createElement("div");
		document.body.appendChild(target);
		const handler = vi.fn();

		const component = mount(ConflictFileDetails, {
			target,
			props: { file, counter: 0, styled: false },
			events: { file: handler },
		});

		await fireEvent.click(target.firstElementChild as HTMLElement);

		expect(handler).not.toHaveBeenCalled();

		void unmount(component);
		target.remove();
	});
});
