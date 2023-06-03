import { ItemView, Modal, WorkspaceLeaf } from "obsidian";
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

export const RIGHT_DIFF_VIEW = "right-diff-view";

export class RightDiffView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return RIGHT_DIFF_VIEW;
	}

	getDisplayText(): string {
		return "Right diff view";
	}

	async onOpen(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h4", { text: "Right diff view" });
	}

	async onClose(): Promise<void> {
		// Nothing to clean up.
	}
}
