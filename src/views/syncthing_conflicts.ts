import { App, Modal, Setting } from "obsidian";
import { SyncthingController } from "../controllers/syncthing_controller";
import { Failure } from "src/models/failures";
import { DiffModal } from "./syncthing_diff";

/**
 * Modal to display the files in conflict when syncing w/ Syncthing.
 * @extends Modal
 * @param app - The Obsidian App instance.
 */
export class ConflictsModal extends Modal {
	constructor(app: App, public syncthingController: SyncthingController) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Conflicting files w/ Syncthing" });
		const conflictFiles = await this.syncthingController.getConflicts();

		if (conflictFiles instanceof Failure) {
			new Setting(contentEl)
				.setName("Failed to get conflicts")
				.setDesc(conflictFiles.message)
				.addButton((button) => {
					button
						.setButtonText("Try again")
						.setCta()
						.onClick(() => {
							this.close();
							this.open();
						});
				});
			return;
		}

		for (const file of conflictFiles) {
			new Setting(contentEl)
				.setName(file.basename)
				.setDesc(file.path)
				.addButton((button) => {
					button
						.setButtonText("Open")
						.setCta()
						.onClick(() => {
							new DiffModal(
								this.app,
								file,
								this.syncthingController
							).open();
						});
				});
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	// Utils fonctions
}
