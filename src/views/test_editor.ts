import TestEditor from "../components/test_editor.svelte";
import { App, Modal, TFile } from "obsidian";

export class TestModal extends Modal {
	private component?: TestEditor;
	private originalContent?: string;
	private modifiedContent?: string;
	constructor(
		app: App,
		public originalFile: TFile,
		public modifiedFile: TFile
	) {
		super(app);
	}

	async onOpen() {
		this.originalContent = await this.app.vault.read(this.originalFile);
		this.modifiedContent = await this.app.vault.read(this.modifiedFile);
		this.component = new TestEditor({
			target: this.contentEl,
			props: {
				parentModal: this,
				originalContent: this.originalContent,
				modifiedContent: this.modifiedContent,
			},
		});
		this.modalEl.addClass("syncthing-diff-editor-modal");
		this.contentEl.addClass("syncthing-diff-editor");
		this.titleEl.setText(
			`Resolve conflicts - ${this.originalFile.basename}`
		);
	}
	onClose(): void {
		this.component?.$destroy();
	}
}
