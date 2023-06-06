import { App, Modal, Setting } from "obsidian";
import { Failure } from "src/models/failures";
import { SyncthingController } from "../controllers/syncthing_controller";
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
				.setHeading()
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

		// TODO: rank the conflicts by date
		new Setting(contentEl)
			.setName("Order by date")
			.setHeading()
			.addButton((button) => {
				button
					.setButtonText("Order by date")
					.setCta()
					.onClick(() => {
						// this.close();
						// this.open();
					});
			});

		// List of conflicts
		for (const file of conflictFiles) {
			const filenameProps =
				this.syncthingController.parseConflictFilename(file.name);
			if (filenameProps instanceof Failure) {
				new Setting(contentEl)
					.setName(filenameProps.message)
					.setDesc(file.basename)
					.addButton((button) =>
						button.setButtonText("ERROR").setWarning()
					);
				continue;
			}
			const dateString = filenameProps.date.toString();
			const timeString = filenameProps.time.toString();
			const conflictDate = `${dateString.slice(0, 4)}-${dateString.slice(
				4,
				6
			)}-${dateString.slice(6, 8)} ${timeString.slice(
				0,
				2
			)}:${timeString.slice(2, 4)}:${timeString.slice(4, 6)}`;
			const fileSetting = new Setting(contentEl)
				.setName(filenameProps.filename)
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
			// Description
			const infoList = fileSetting.descEl.createEl("ul");
			infoList.createEl("li", {
				text: `Last modified: ${conflictDate}`,
			});
			infoList.createEl("li", {
				text: `Modified by: ${filenameProps.modifiedBy}`,
			});
			infoList.createEl("li", {
				text: `File Extension: ${filenameProps.extension}`,
			});
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	// Utils fonctions
}
