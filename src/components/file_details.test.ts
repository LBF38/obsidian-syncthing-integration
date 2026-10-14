// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { makeFile } from "../../test/helpers/files";
import FileDetails from "./file_details.svelte";

afterEach(cleanup);

describe("file_details.svelte", () => {
	it("renders the file metadata", () => {
		const file = makeFile("Notes/Note.md", {
			stat: { size: 2048, mtime: 0, ctime: 0 },
		});

		const { container } = render(FileDetails, { props: { file } });

		expect(container.textContent).toContain("Extension:");
		expect(container.textContent).toContain("md");
		expect(container.textContent).toContain("Size: 2 KB");
		expect(container.textContent).toContain("Last modified at:");
		expect(container.textContent).toContain("Created at:");
		expect(container.textContent).toContain("Notes/Note.md");
	});

	it("formats the size", () => {
		const file = makeFile("big.bin", {
			stat: { size: 1024 ** 2, mtime: 0, ctime: 0 },
		});

		const { container } = render(FileDetails, { props: { file } });

		expect(container.textContent).toContain("Size: 1 MB");
	});
});
