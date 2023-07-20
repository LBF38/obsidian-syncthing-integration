import { MergeView } from "@codemirror/merge";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { App, ButtonComponent, Modal } from "obsidian";

export class CodeMirrorEditorModal extends Modal {
	private editor?: MergeView;
	constructor(
		app: App,
		public originalContent: string,
		public modifiedContent: string
	) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;
		this.modalEl.addClass("syncthing-codemirror-editor-modal");
		contentEl.addClass("syncthing-codemirror-editor");
		this.titleEl.setText("File name for this diff");
		let container = contentEl.createDiv({
			cls: "syncthing-codemirror-editor-container",
		});

		this.editor = new MergeView({
			a: {
				doc: this.originalContent,
				extensions: [basicSetup, EditorView.darkTheme.of(true)],
			},
			b: {
				doc: this.modifiedContent,
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
			doc: `\n${this.editor.a.state.doc}\n${this.editor.b.state.doc}\n`,
			extensions: [
				basicSetup,
				EditorView.editable.of(false),
				EditorView.darkTheme.of(true),
				EditorView.baseTheme({
					".cm-cursor": {
						borderLeftColor: "white",
					},
				}),
			],
			parent: contentEl.createDiv({
				cls: "syncthing-codemirror-editor-container",
			}),
		});

		const tools = contentEl.createDiv({
			cls: "syncthing-codemirror-editor-tools",
		});
		new ButtonComponent(tools).setButtonText("Cancel").onClick(() => {
			this.close(); // TODO: implement logic if necessary
		});
		new ButtonComponent(tools).setButtonText("Save").onClick(() => {
			this.close(); // TODO: implement logic if necessary
		});
		new ButtonComponent(tools).setButtonText("Back").onClick(() => {
			this.close(); // TODO: implement logic if necessary
		});
	}

	async onClose() {
		this.editor?.destroy();
	}
}
