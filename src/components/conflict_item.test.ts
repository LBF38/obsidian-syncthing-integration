// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import type { TFile } from "obsidian";
import type { SyncthingController } from "src/controllers/main_controller";
import type { ConflictsModal } from "src/views/conflicts_modal";
import { DiffModal } from "src/views/diff_modal";
import { makeConflictFile, makeFile } from "../../test/helpers/files";
import ConflictItem from "./conflict_item.svelte";

vi.mock("src/views/diff_modal", () => ({
	DiffModal: vi.fn(function (this: { open: () => void }) {
		this.open = vi.fn();
	}),
}));

beforeEach(() => {
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

function makeConflicts(count: number): TFile[] {
	return Array.from({ length: count }, (_, index) =>
		makeConflictFile({
			filename: "Note",
			date: `2021010${index + 1}`,
			time: "000000",
			modifiedBy: "AAAAAAA",
		}),
	);
}

const parentModal = { app: {} } as unknown as ConflictsModal;
const controller = {} as SyncthingController;

describe("conflict_item.svelte", () => {
	it("renders the filename and the number of conflicts", () => {
		const { container } = render(ConflictItem, {
			props: {
				conflicts: makeConflicts(2),
				syncthingController: controller,
				parentModal,
			},
		});

		expect(container.textContent).toContain("Note");
		expect(container.textContent).toContain("2 conflicts");
		expect(container.textContent).toContain("View conflicts");
	});

	it("uses the singular form for a single conflict", () => {
		const { container } = render(ConflictItem, {
			props: {
				conflicts: makeConflicts(1),
				syncthingController: controller,
				parentModal,
			},
		});

		expect(container.textContent).toContain("1 conflict");
		expect(container.textContent).not.toContain("1 conflicts");
	});

	it("opens a DiffModal for the first conflict when clicking the button", async () => {
		const conflicts = makeConflicts(2);

		const { container } = render(ConflictItem, {
			props: {
				conflicts,
				syncthingController: controller,
				parentModal,
			},
		});

		const button = container.querySelector("button") as HTMLButtonElement;
		await fireEvent.click(button);

		expect(DiffModal).toHaveBeenCalledWith(
			parentModal.app,
			conflicts[0],
			controller,
		);
	});

	it("shows the failure message when the first filename is invalid", () => {
		const invalid = makeFile("Note.md");

		const { container } = render(ConflictItem, {
			props: {
				conflicts: [invalid],
				syncthingController: controller,
				parentModal,
			},
		});

		expect(container.textContent).toContain("Error parsing conflict filename");
		expect(container.querySelectorAll("details")).toHaveLength(1);
	});
});
