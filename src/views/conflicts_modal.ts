import { App, Modal } from "obsidian";
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
}
