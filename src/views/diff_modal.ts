import { createTwoFilesPatch } from "diff";
import { html, type Diff2HtmlConfig } from "diff2html";
import { App, ButtonComponent, Modal, Notice, Setting, TFile } from "obsidian";
import { type SyncthingController } from "src/controllers/main_controller";
import { type ConflictFilename } from "src/models/entities";
import { Failure } from "src/models/failures";
import { MergeModal } from "./merge_editor";

export class DiffModal extends Modal {
	d2hUI?: string;
	d2hColorBlind = false;
	originalFile: TFile;
	conflictingFiles: TFile[] | Failure;
	conflictingFilesProperties: Map<TFile, ConflictFilename | Failure>;
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
		this.conflictingFilesProperties = new Map();
	}

	async onOpen() {
		// TODO: #20 General UI improvements => use React for better state management & UI.
		const { contentEl } = this;

		({
			originalFile: this.originalFile,
			conflictingFiles: this.conflictingFiles,
			conflictingFilesProperties: this.conflictingFilesProperties,
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
			cls: [
				"diff",
				"diff-modal-container",
				this.d2hColorBlind ? "colorblind" : "",
			],
		});

		// Left side : list of all conflicting files.
		const leftSide = diffContainer.createDiv();
		leftSide.createEl("h1", { text: "Conflicting files" });
		// TODO: change to sorting by conflict date.
		// this.conflictingFiles.sort((a, b) => {
		// 	return (
		// 		this.conflictingFilesProperties.get(a)?.conflictDate -
		// 		this.conflictingFilesProperties.get(b)?.conflictDate
		// 	);
		// });
		this.conflictingFiles.forEach((file) => {
			const fileProperties = this.conflictingFilesProperties.get(file);
			if (fileProperties === undefined) {
				new Notice("Error getting conflicting files properties.");
				return;
			}
			if (fileProperties instanceof Failure) {
				new Setting(leftSide)
					.setName(fileProperties.message)
					.setDesc(file.path);
				return;
			}
			console.log(fileProperties);
			const fileSetting = new Setting(leftSide);
			fileSetting
				.setName(fileProperties.filename)
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
						});
				})
				.addButton((button) => {
					button.setButtonText("Open").onClick(() => {
						this.app.workspace.openLinkText(
							file.path,
							"",
							"window"
						);
					});
				});
			// TODO: enhance description w/ more info on conflict file. (path, size, date, etc.)
			const settingDescList = fileSetting.descEl.createEl("ul");
			const fileDescList = [
				`Conflict date : ${fileProperties.dateTime.toISOString()}`,
				`Size : ${file.stat.size.toString()} Bytes`,
				`Last modified : ${new Date(file.stat.mtime).toISOString()}`,
				`Modified by : ${fileProperties.modifiedBy}`,
				`Path : ${file.path}`,
			];
			for (const desc of fileDescList) {
				settingDescList.createEl("li", {
					text: desc,
				});
			}
		});

		// Middle : diff between the two files.
		const middle = diffContainer.createDiv();
		middle.createEl("h1", { text: "Diff" });
		new Setting(middle)
			.setName("Enable colorblind mode")
			.addToggle((toggle) => {
				toggle.setValue(this.d2hColorBlind).onChange((value) => {
					this.d2hColorBlind = value;
					this.close();
					this.open();
				});
			});
		middle.createDiv({ attr: { id: "diff-ui" } });
		middle.createDiv().innerHTML = this.d2hUI ?? "";

		// Right side : Details about the original file.
		const rightSide = diffContainer.createDiv();
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
				new Notice("Resolving conflict : Accepting left", 5000);
				const filenamePath = this.originalFile.path;
				setTimeout(
					() => new Notice(`Deleting ${filenamePath}...`, 5000),
					500
				);
				this.app.vault.delete(this.originalFile);
				setTimeout(() => {
					new Notice(
						`Renaming ${this.currentConflictFile.path} to ${filenamePath}...`,
						5000
					);
				}, 1000);
				this.app.fileManager.renameFile(
					this.currentConflictFile,
					filenamePath
				);
				setTimeout(() => {
					new Notice(`Conflict resolved : Accepted left`, 5000);
				}, 2000);
				this.originalFile = this.currentConflictFile;
				new DiffModal(
					this.app,
					this.originalFile,
					this.syncthingController
				);
			});
		new ButtonComponent(buttonsContainer)
			.setButtonText("Accept original")
			.setCta()
			.onClick(() => {
				this.close();
				new Notice("Resolving conflict : Accepting original", 5000);
				setTimeout(
					() =>
						new Notice(
							`Deleting ${this.currentConflictFile.path}...`,
							5000
						),
					1000
				);
				this.app.vault.delete(this.currentConflictFile);
				new DiffModal(
					this.app,
					this.originalFile,
					this.syncthingController
				);
			});
		new ButtonComponent(buttonsContainer)
			.setButtonText("Open files in new panes")
			.setCta()
			// .onClick(this.buildManualDiffPanes);
			.onClick(async () => {
				new MergeModal(
					this.app,
					this.originalFile,
					this.currentConflictFile
				).open();
			});

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

	buildManualDiffPanes = async () => {
		const leftPane = this.app.workspace.openPopoutLeaf();
		leftPane.openFile(this.currentConflictFile);
		const lowerPane = this.app.workspace.createLeafBySplit(
			leftPane,
			"horizontal"
		);
		lowerPane.openFile(this.originalFile);
		const rightPane = this.app.workspace.createLeafBySplit(
			leftPane,
			"vertical"
		);
		const rightPaneEl = rightPane.view.containerEl;
		rightPaneEl.empty();
		rightPane.view.navigation = false;
		rightPaneEl.addClass("diff");
		if (this.d2hColorBlind) rightPaneEl.addClass("colorblind");
		rightPaneEl.title = "Difference tab";
		rightPaneEl.createEl("h1", {
			text: `Difference tab`,
		});
		new Setting(rightPaneEl)
			.setName("Enable colorblind mode")
			.addToggle((toggle) => {
				toggle.setValue(this.d2hColorBlind).onChange((value) => {
					this.d2hColorBlind = value;
					leftPane.getContainer().win.close();
					// this.open();
					// TODO: add function to change the colorblind mode. (rebuild all state UI) => use of React for views ?
					// this.buildManualDiffPanes();
				});
			});
		rightPaneEl.createEl("ul").append(
			createEl("li", {
				text: `Green : ${this.originalFile.basename}`,
			}),
			createEl("li", {
				text: `Red : ${this.currentConflictFile.basename}`,
			})
		);
		rightPaneEl.createDiv().innerHTML = await this.getDiffContent(
			this.originalFile,
			this.currentConflictFile
		);

		// TODO: #18 IDEA: create a workspace leaf with all the files in conflict.
		if (this.conflictingFiles instanceof Failure) return;
		this.conflictingFiles.remove(this.currentConflictFile);
		this.app.workspace.setActiveLeaf(leftPane);
		for (const conflictFile of this.conflictingFiles) {
			const leaf = this.app.workspace.getLeaf("tab");
			leaf.openFile(conflictFile);
		}
		this.app.workspace.setActiveLeaf(leftPane);
	};
}
