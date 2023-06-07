import { createTwoFilesPatch } from "diff";
import { Diff2HtmlConfig, html } from "diff2html";
import { App, ButtonComponent, Modal, Setting, TFile } from "obsidian";
import { SyncthingController } from "src/controllers/syncthing_controller";
import { Failure } from "src/models/failures";

export class DiffModal extends Modal {
	d2hUI?: string;
	originalFile: TFile;
	conflictingFiles: TFile[] | Failure;
	currentConflictFile: TFile;
	constructor(
		app: App,
		public file: TFile,
		public syncthingController: SyncthingController
	) {
		super(app);
		this.conflictingFiles = [];
		this.originalFile = file;
		this.currentConflictFile = file;
	}

	async onOpen() {
		const { contentEl } = this;

		({
			originalFile: this.originalFile,
			conflictingFiles: this.conflictingFiles,
		} = await this.syncthingController.getDiffFiles(this.file));

		if (this.conflictingFiles instanceof Failure) {
			contentEl.createEl("h1", { text: "Diff w/ Syncthing" });
			new Setting(contentEl)
				.setName("Failed to get diff")
				.setDesc(this.conflictingFiles.message)
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

		// Container for the 3 columns.
		const diffContainer = contentEl.createDiv({
			cls: ["diff", "diff-modal-container"],
		});

		// Left side : list of all conflicting files.
		const leftSide = diffContainer.createDiv({
			cls: ["diff", "diff-modal-left-side"],
		});
		leftSide.createEl("h1", { text: "Conflicting files" });
		// TODO: change to sorting by conflict date.
		this.conflictingFiles.sort((a, b) => a.stat.mtime - b.stat.mtime);
		this.conflictingFiles.forEach((file) => {
			new Setting(leftSide)
				.setName(file.basename)
				// TODO: enhance description w/ more info on conflict file. (path, size, date, etc.)
				.setDesc(
					new Date(file.stat.mtime).toString() + "\n" + file.path
				)
				.addButton((button) => {
					button
						.setButtonText("Resolve conflict")
						.setCta()
						.onClick(async () => {
							this.currentConflictFile = file;
							this.d2hUI = await this.getDiffContent(
								this.originalFile,
								this.currentConflictFile
							);
							this.close();
							this.open();
							// TODO: add logic to resolve conflict.
						});
				})
				.addButton((button) => {
					button.setButtonText("Open").onClick(() => {
						this.app.workspace.openLinkText(file.path, "", "window");
						// button.setDisabled(true);
					});
				});
		});

		// Middle : diff between the two files.
		const middle = diffContainer.createDiv({
			cls: ["diff", "diff-modal-middle"],
		});
		middle.createEl("h1", { text: "Diff" });
		middle.createDiv({ attr: { id: "diff-ui" } });
		middle.createDiv().innerHTML = this.d2hUI ?? "";

		// Right side : Details about the original file.
		const rightSide = diffContainer.createDiv({
			cls: ["diff", "diff-modal-right-side"],
		});
		rightSide.createEl("h1", { text: "Original file" });
		rightSide.createDiv({ text: "Original file content & details" });
		const rightSideSetting = new Setting(rightSide)
			.setName(this.originalFile.basename)
			.setHeading()
			.setDesc("Details");
		const rightSideList = rightSideSetting.descEl.createEl("ul");
		rightSideList.createEl("li", {
			text: `Size : ${this.originalFile.stat.size.toString()} Bytes`,
		});
		rightSideList.createEl("li", {
			text: `Last modified : ${new Date(
				this.originalFile.stat.mtime
			).toString()}`,
		});
		rightSideList.createEl("li", {
			text: `Created by : <insert device ID or name>`,
		});

		// Adding buttons for managing the conflict.
		const buttonsContainer = contentEl.createDiv({
			cls: ["diff", "diff-modal-buttons-container"],
		});
		// TODO: add logic to resolve conflict. (for the 3 buttons)
		new ButtonComponent(buttonsContainer)
			.setButtonText("Accept left")
			.setCta()
			.onClick(() => {
				this.close();
				this.app.vault.trash(this.originalFile, true);
				this.app.fileManager.renameFile(
					this.currentConflictFile,
					"/conflict_resolved.md"
				);
				this.open();
			});
		new ButtonComponent(buttonsContainer)
			.setButtonText("Accept original")
			.setCta()
			.onClick(() => {});
		new ButtonComponent(buttonsContainer)
			.setButtonText("Open files in new panes")
			.setCta()
			.onClick(() => {});

		// CSS styling for the modal.
		this.modalEl.setCssStyles({
			width: "100%",
			height: "100%",
		});

		diffContainer.setCssStyles({
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			padding: "1rem",
			alignSelf: "start",
		});

		buttonsContainer.setCssStyles({
			display: "flex",
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
			padding: "1rem",
			// margin: "0 auto",
		});

		leftSide.setCssStyles({
			height: "100%",
			overflow: "auto",
			alignSelf: "start",
		});

		middle.setCssStyles({
			width: "50%",
			height: "100%",
			overflow: "auto",
			padding: "1rem",
			alignContent: "top",
			alignSelf: "start",
		});

		rightSide.setCssStyles({
			height: "100%",
			overflow: "auto",
			alignSelf: "start",
		});

		// CSS Styling for ButtonComponent.
		const buttonComponent =
			buttonsContainer.getElementsByClassName("mod-cta");
		Array.from(buttonComponent).forEach((button) => {
			(button as HTMLElement).setCssStyles({
				margin: "1rem",
			});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	// Utils fonctions
	async getDiffContent(file1: TFile, file2: TFile): Promise<string> {
		const filesDiff = createTwoFilesPatch(
			file1.basename,
			file2.basename,
			await this.app.vault.read(file1),
			await this.app.vault.read(file2)
		);
		const d2hUIConfig: Diff2HtmlConfig = {
			outputFormat: "line-by-line",
			drawFileList: false,
		};
		return html(filesDiff, d2hUIConfig);
	}
}
