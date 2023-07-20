import { MergeView } from "@codemirror/merge";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { App, Modal, View } from "obsidian";
import { basicSetup } from "codemirror";

export class CodeMirrorEditorModal extends Modal {
	private editor?: MergeView;
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;
		this.titleEl.setText("File name for this diff");
		let container = contentEl.createDiv();
		let doc = `some text`;
		this.editor = new MergeView({
			a: {
				doc,
				extensions: [basicSetup, EditorView.darkTheme.of(true)],
			},
			b: {
				doc: doc.replace(/x/g, "y") + "\nSome more text",
				extensions: [
					basicSetup,
					EditorView.editable.of(false),
					EditorState.readOnly.of(true),
					EditorView.darkTheme.of(true),
				],
			},
			parent: container,
		});
		let result = new EditorView({
			doc: doc,
			extensions: [basicSetup, EditorView.darkTheme.of(true)],
			parent: container,
		});
	}

	async onClose() {
		this.editor?.destroy();
	}
}
