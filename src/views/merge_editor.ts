import MergeEditor from "../components/merge_editor.svelte";
import { App, Modal, TFile } from "obsidian";

export class MergeModal extends Modal {
	private component?: MergeEditor;
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
		this.component = new MergeEditor({
			target: this.contentEl,
			props: {
				parentModal: this,
				originalContent: this.originalContent,
				modifiedContent: this.modifiedContent,
			},
		});
		this.modalEl.addClass("syncthing-merge-editor-modal");
		this.contentEl.addClass("syncthing-merge-editor");
		this.titleEl.setText(
			`Resolve conflicts - ${this.originalFile.basename}`
		);
	}
	onClose(): void {
		this.component?.$destroy();
	}
}
