import { App, Modal, TFile } from "obsidian";
import cmDiffEditor from "../components/diff_editor.svelte";

export class CodeMirrorEditorModal extends Modal {
	private svelteComponent: cmDiffEditor;
	constructor(
		app: App,
		public originalFile: TFile,
		public modifiedFile: TFile
	) {
		super(app);
		this.svelteComponent = new cmDiffEditor({
			target: this.contentEl,
			props: {
				cmEditorModal: this,
			},
		});
	}

	async onOpen() {
		this.modalEl.addClass("syncthing-codemirror-editor-modal");
		this.contentEl.addClass("syncthing-codemirror-editor");
		this.titleEl.setText(
			`Resolving file conflicts - ${this.originalFile.name}`
		);
	}

	async onClose() {
		this.svelteComponent.$destroy();
	}
}
