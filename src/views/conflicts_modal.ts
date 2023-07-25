import { App, Modal, Setting } from "obsidian";
import { Failure } from "src/models/failures";
import { type SyncthingController } from "../controllers/main_controller";
import { DiffModal } from "./diff_modal";

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
				button.setButtonText("Order by date").onClick(() => {
					// this.close();
					// this.open();
				});
			});

		contentEl.createEl("hr");

		// List of conflicts
		// TODO: make it collapsible and group them by files
		for (const conflictFilename of conflictFiles.keys()) {
			const conflictFilesList = conflictFiles.get(conflictFilename);
			if (conflictFilesList === undefined) {
				console.log(conflictFilename, conflictFilesList);
				console.log(conflictFiles);
				continue;
			}
			const conflictFilesDetailsEl = contentEl.createEl("details", {});
			const summary = conflictFilesDetailsEl.createEl("summary", {
				text: "Open for more details",
			});
			new Setting(summary)
				.setName(
					`${conflictFilename} (${conflictFilesList.length} conflicts)`
				)
				.addButton((button) =>
					button
						.setCta()
						.setButtonText("Open diff modal")
						.onClick(() => {
							new DiffModal(
								this.app,
								conflictFilesList[0],
								this.syncthingController
							).open();
						})
				);
			for (const file of conflictFilesList) {
				const filenameProps =
					this.syncthingController.parseConflictFilename(file.name);
				if (filenameProps instanceof Failure) {
					new Setting(conflictFilesDetailsEl)
						.setName(filenameProps.message)
						.setDesc(file.basename)
						.addButton((button) =>
							button.setButtonText("ERROR").setWarning()
						);
					continue;
				}
				// TODO: enhance date formats to enable sorting
				const dateString = filenameProps.date;
				const timeString = filenameProps.time;
				const conflictDate = `${dateString.slice(
					0,
					4
				)}-${dateString.slice(4, 6)}-${dateString.slice(
					6,
					8
				)} ${timeString.slice(0, 2)}:${timeString.slice(
					2,
					4
				)}:${timeString.slice(4, 6)}`;
				const fileSetting = new Setting(conflictFilesDetailsEl).setName(
					filenameProps.filename
				);
				// Description
				const infoList = fileSetting.descEl.createEl("ul");
				infoList.createEl("li", {
					text: `Conflict date: ${conflictDate}`,
				});
				infoList.createEl("li", {
					text: `Modified by: ${filenameProps.modifiedBy}`,
				});
				infoList.createEl("li", {
					text: `File Extension: ${filenameProps.extension}`,
				});
			}
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	// Utils fonctions
}
