import { App, Modal, TFile } from "obsidian";
import { Failure } from "src/models/failures";
import { SvelteComponent } from "svelte";
import ConflictsListComponent from "../components/conflicts_list.svelte";
import FailureComponent from "../components/error.svelte";
import { type SyncthingController } from "../controllers/main_controller";

/**
 * Modal to display the files in conflict when syncing w/ Syncthing.
 * @extends Modal
 * @param app - The Obsidian App instance.
 */
export class ConflictsModal extends Modal {
	private components?: SvelteComponent[] = [];
	constructor(app: App, public syncthingController: SyncthingController) {
		super(app);
	}

	async onOpen() {
		this.titleEl.style.textAlign = "center";
		const conflictFiles = await this.syncthingController.getConflicts();
		if (conflictFiles instanceof Failure) {
			this.components?.push(
				new FailureComponent({
					target: this.contentEl,
					props: {
						failure: conflictFiles,
					},
				})
			);
			return;
		}

		this.components?.push(
			new ConflictsListComponent({
				target: this.contentEl,
				props: {
					parentModal: this,
					conflicts: conflictFiles,
				},
			})
		);
	}

	onClose() {
		this.components?.forEach((component) => {
			component.$destroy();
		});
		const { contentEl } = this;
		contentEl.empty();
	}

	// Utils function
	sortFilesBy(
		files: Map<string, TFile[]>,
		type: "recent" | "old" | "a-to-z" | "z-to-a"
	): Map<string, TFile[]> {
		const arrayOfKeys = Array.from(files.keys());
		switch (type) {
			case "recent":
				arrayOfKeys.sort((a, b) => {
					const aDate = files.get(a)?.[0]?.stat.mtime ?? 0;
					const bDate = files.get(b)?.[0]?.stat.mtime ?? 0;
					return bDate - aDate;
				});
				break;
			case "old":
				arrayOfKeys.sort((a, b) => {
					const aDate = files.get(a)?.[0]?.stat.mtime ?? 0;
					const bDate = files.get(b)?.[0]?.stat.mtime ?? 0;
					return aDate - bDate;
				});
				break;
			case "a-to-z":
				arrayOfKeys.sort((a, b) => a.localeCompare(b));
				break;
			case "z-to-a":
				arrayOfKeys.sort((a, b) => b.localeCompare(a));
				break;
		}
		const sortedFiles = new Map<string, TFile[]>();
		arrayOfKeys.forEach((key) => {
			sortedFiles.set(key, files.get(key) ?? []);
		});
		return sortedFiles;
	}
}
