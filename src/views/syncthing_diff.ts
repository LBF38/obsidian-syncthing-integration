import { App, ItemView, Modal, Setting, WorkspaceLeaf } from "obsidian";
import { createTwoFilesPatch } from "diff";
import { defaultDiff2HtmlConfig, html } from "diff2html";

export const MAIN_DIFF_VIEW = "main-diff-view";

export class MainDiffView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return MAIN_DIFF_VIEW;
	}

	getDisplayText() {
		return "Example view";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Example view" });
		this.contentEl.setText("Hello world!");
		this.contentEl.createEl("h1", { text: "Hello world!" });
		const file1 = {
			tfile: this.app.vault.getMarkdownFiles()[0],
			content: await this.app.vault.read(
				this.app.vault.getMarkdownFiles()[0]
			),
		};
		const file2 = {
			tfile: this.app.vault.getMarkdownFiles()[1],
			content: await this.app.vault.read(
				this.app.vault.getMarkdownFiles()[1]
			),
		};
		this.contentEl.createEl("h1", { text: file1.tfile.basename });
		this.contentEl.createDiv({ text: file1.content });
		this.contentEl.createEl("h1", { text: file2.tfile.basename });
		this.contentEl.createDiv({ text: file2.content });
		this.containerEl
			.createEl("button", { text: "Diff" })
			.addEventListener("click", () => {
				createTwoFilesPatch(
					file1.tfile.basename,
					file2.tfile.basename,
					file1.content,
					file2.content
				);
			});
		const difference = createTwoFilesPatch(
			file1.tfile.basename,
			file2.tfile.basename,
			file1.content,
			file2.content
		);
		this.contentEl.createEl("h1", { text: "Difference" });
		this.contentEl.createDiv({ text: difference });
		this.contentEl
			.createEl("button", { text: "Open diff between files" })
			.addEventListener("click", () => {
				new Modal(this.app).open();
				// new SampleModal( // ! Change this to a better UI.
				// 	app,
				// 	html(difference, defaultDiff2HtmlConfig)
				// ).open();
			});
	}

	async onClose() {
		// Nothing to clean up.
	}
}

export class DiffModal extends Modal {
	constructor(app: App, public content: string) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		// Left side : list of all conflicting files.
		const leftSide = contentEl.createDiv({
			cls: ["diff", "diff-modal-left-side"],
		});
		leftSide.createEl("h1", { text: "Conflicting files" });
		const files = this.app.vault.getMarkdownFiles();
		files.forEach((file) => {
			new Setting(leftSide)
				.setName(file.basename)
				.setDesc(file.stat.mtime.toString())
				.addButton((button) => {
					button
						.setButtonText("Resolve conflict")
						.setCta()
						.onClick(() => {
							// TODO: add logic to resolve conflict.
						});
				});
		});

		// Middle : diff between the two files.
		const middle = contentEl.createDiv({
			cls: ["diff", "diff-modal-middle"],
		});
		middle.createEl("h1", { text: "Diff" });
		middle.createDiv({ text: "This is the difference between two files." });

		// Right side : Details about the original file.
		const rightSide = contentEl.createDiv({
			cls: ["diff", "diff-modal-right-side"],
		});
		rightSide.createEl("h1", { text: "Original file" });
		rightSide.createDiv({ text: "Original file content & details" });
		new Setting(rightSide)
			.setName(files[1].basename)
			.setDesc("Details")
			.settingEl.createEl("ul")
			.createEl("li", {
				text: `Size : ${files[0].stat.size.toString()}`,
			});

		// Bottom : Buttons to resolve the conflict.
		// const bottom = contentEl.createDiv({ cls: "diff-modal-bottom" });
		// bottom.createEl("h1", { text: "Resolve conflict" });
		// bottom.createDiv({ text: "Resolve conflict content" });

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
			height: "100%",
			overflow: "auto",
		});

		rightSide.setCssStyles({
			height: "100%",
			overflow: "auto",
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
