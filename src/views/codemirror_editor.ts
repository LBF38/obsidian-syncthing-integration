import { MergeView } from "@codemirror/merge";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { App, ButtonComponent, Modal } from "obsidian";
import DiffEditor from "../components/diff_editor.svelte";

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
		const container = contentEl.createDiv({
			cls: "syncthing-codemirror-editor-container",
		});

		const mergeEditor = new MergeView({
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

		const result = new EditorView({
			doc: `\n${mergeEditor.a.state.doc}\n${mergeEditor.b.state.doc}\n`,
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
			dispatch(transaction, view) {
				updateResultEditor();
			},
			parent: contentEl.createDiv({
				cls: "syncthing-codemirror-editor-container",
			}),
		});

		function updateResultEditor() {
			const leftSide = mergeEditor.a.state.doc;
			const rightSide = mergeEditor.b.state.doc;
			const resultDoc = `\n${leftSide}\n${rightSide}\n`;
			const transaction = result.state.update({
				changes: {
					from: 0,
					insert: resultDoc,
				},
			});
			result.dispatch(transaction);
			console.log("updateResultEditor");
		}

		new DiffEditor({
			target: contentEl,
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
