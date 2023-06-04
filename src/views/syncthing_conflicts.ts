import { App, Modal, Setting } from "obsidian";
import { SyncthingController } from "src/controllers/syncthing_controller";
import { Failure } from "src/models/failures";

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
		contentEl.setText("Conflicting files");

		contentEl.createEl("h1", { text: "Conflicting files w/ Syncthing" });
		const conflictFiles = await this.syncthingController.getConflicts();

		if (conflictFiles instanceof Failure) {
			new Setting(contentEl)
				.setName("Error")
				.setDesc(
					"Could not get the conflicts : " + conflictFiles.message
				)
				.addButton((button) => {
					button
						.setButtonText("Retry")
						.setCta()
						.onClick(() => {
							this.onOpen();
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
							this.app.workspace.openLinkText(
								file.path,
								"",
								true
							);
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
