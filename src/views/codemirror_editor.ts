import { MergeView } from "@codemirror/merge";
import { Annotation, EditorState, Transaction } from "@codemirror/state";
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
		console.log(mergeEditor);
		// mergeEditor.a.dispatch = (transaction) =>
		// 	syncDispatch(transaction, mergeEditor.a, result);
		// mergeEditor.a.dispatch = (transaction) =>
		// 	transaction instanceof Transaction
		// 		? syncDispatch(transaction, mergeEditor.a, result)
		// 		: undefined;

		const startState = EditorState.create({
			doc: "shared state",
			extensions: [basicSetup, EditorView.darkTheme.of(true)],
		});

		const editorA: EditorView = new EditorView({
			state: startState,
			extensions: [basicSetup, EditorView.darkTheme.of(true)],
			dispatch: (transaction) =>
				syncDispatch(transaction, editorA, result, editorB),
			parent: contentEl.appendChild(
				container.cloneNode(false)
			) as HTMLElement,
		});

		const editorB: EditorView = new EditorView({
			state: startState,
			extensions: [basicSetup, EditorView.darkTheme.of(true)],
			dispatch: (transaction) =>
				syncDispatch(transaction, editorB, result, editorA),
			parent: contentEl.appendChild(
				container.cloneNode(false)
			) as HTMLElement,
		});

		const result: EditorView = new EditorView({
			// doc: `\n${mergeEditor.a.state.doc}\n${mergeEditor.b.state.doc}\n`,
			state: startState,
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
			dispatch: (transaction) =>
				syncDispatch(transaction, result, editorA, editorB),
			parent: contentEl.createDiv({
				cls: "syncthing-codemirror-editor-container",
			}),
		});
		const syncAnnotation = Annotation.define<boolean>();

		function syncDispatch(
			transaction: Transaction,
			view: EditorView,
			...others: EditorView[]
		) {
			view.update([transaction]);
			if (
				!transaction.changes.empty &&
				!transaction.annotation(syncAnnotation)
			) {
				const annotations: Annotation<string | boolean>[] = [
					syncAnnotation.of(true),
				];
				const userEvent = transaction.annotation(Transaction.userEvent);
				if (userEvent)
					annotations.push(Transaction.userEvent.of(userEvent));
				others.map((editor) =>
					editor.dispatch({
						changes: transaction.changes,
						annotations,
					})
				);
			}
		}

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
