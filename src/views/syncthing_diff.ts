import { createTwoFilesPatch } from "diff";
import { Diff2HtmlConfig, html } from "diff2html";
import { App, Modal, Setting, TFile } from "obsidian";

// CSS styling for the diff.
import "diff2html/bundles/css/diff2html.min.css";
// import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
import { SyncthingController } from "src/controllers/syncthing_controller";
import { Failure } from "src/models/failures";

export class DiffModal extends Modal {
	d2hUI?: string;
	originalFile: TFile;
	conflictingFiles: TFile[] | Failure;
	constructor(
		app: App,
		public file: TFile,
		public syncthingController: SyncthingController
	) {
		super(app);
		this.conflictingFiles = [];
		this.originalFile = file;
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

		// Left side : list of all conflicting files.
		const leftSide = contentEl.createDiv({
			cls: ["diff", "diff-modal-left-side"],
		});
		leftSide.createEl("h1", { text: "Conflicting files" });
		this.conflictingFiles.sort((a, b) => a.stat.mtime - b.stat.mtime);
		this.conflictingFiles.forEach((file) => {
			new Setting(leftSide)
				.setName(file.basename)
				.setDesc(new Date(file.stat.mtime).toString())
				.addButton((button) => {
					button
						.setButtonText("Resolve conflict")
						.setCta()
						.onClick(async () => {
							this.d2hUI = await this.getDiffContent(
								this.originalFile,
								file
							);
							// this.d2hUI.draw();
							this.close();
							this.open();
							// TODO: add logic to resolve conflict.
						});
				});
		});

		// Middle : diff between the two files.
		const middle = contentEl.createDiv({
			cls: ["diff", "diff-modal-middle"],
		});
		middle.createEl("h1", { text: "Diff" });
		middle.createDiv({ attr: { id: "diff-ui" } });
		middle.createDiv().innerHTML = this.d2hUI ?? "";

		// Right side : Details about the original file.
		const rightSide = contentEl.createDiv({
			cls: ["diff", "diff-modal-right-side"],
		});
		rightSide.createEl("h1", { text: "Original file" });
		rightSide.createDiv({ text: "Original file content & details" });
		new Setting(rightSide)
			.setName(this.originalFile.basename)
			.setDesc("Details")
			.settingEl.createEl("ul")
			.createEl("li", {
				text: `Size : ${this.originalFile.stat.size.toString()}`,
			});

		// CSS styling for the modal.
		this.modalEl.setCssStyles({
			width: "100%",
			height: "100%",
		});

		contentEl.setCssStyles({
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			padding: "1rem",
		});

		leftSide.setCssStyles({
			height: "100%",
			overflow: "auto",
		});

		middle.setCssStyles({
			width: "50%",
			height: "100%",
			overflow: "auto",
			padding: "1rem",
		});

		rightSide.setCssStyles({
			height: "100%",
			overflow: "auto",
		});

		// CSS styling for the diff.*
		// const diff = contentEl.find(".diff");
		// diff.setCssStyles({
		// 	border: "1px solid black",
		// 	borderRadius: "5px",
		// 	padding: "1rem",
		// });
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
