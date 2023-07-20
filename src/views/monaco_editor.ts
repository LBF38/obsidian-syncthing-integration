import { App, ButtonComponent, Modal, Setting } from "obsidian";
import * as monaco from "monaco-editor";
import SyncthingPlugin from "src/main";

/**
 * Modal to display the Monaco Editor for the user to edit files that are in conflict.
 */
export class MonacoEditorModal extends Modal {
	private originalModel: monaco.editor.ITextModel;
	private modifiedModel: monaco.editor.ITextModel;
	private editor?: monaco.editor.IStandaloneDiffEditor;
	constructor(
		app: App,
		public plugin: SyncthingPlugin,
		originalContent: string,
		modifiedContent: string
	) {
		super(app);
		this.originalModel = monaco.editor.createModel(
			originalContent,
			"text/plain"
		);
		this.modifiedModel = monaco.editor.createModel(
			modifiedContent,
			"text/plain"
		);
	}

	async onOpen() {
		const { contentEl } = this;
		this.modalEl.addClass("syncthing-monaco-editor-modal");
		contentEl.addClass("syncthing-monaco-editor");
		const containerEl = contentEl.createDiv({
			cls: "monaco-editor-container",
		});
		this.titleEl.setText("File name for this diff");
		// For debug
		// TODO: remove.
		this.originalModel = monaco.editor.createModel(
			/* set from `originalModel`: */ `hello world`,
			"text/plain"
		);
		this.modifiedModel = monaco.editor.createModel(
			/* set from `modifiedModel`: */ `Hello World!`,
			"text/plain"
		);

		this.editor = monaco.editor.createDiffEditor(containerEl, {
			readOnly: false,
			automaticLayout: true,
			renderSideBySide: true,
			originalAriaLabel: "Original content",
			modifiedAriaLabel: "Modified content",
			ariaLabel: "Content Diff",
			theme: "vs-dark",
		});
		this.editor.setModel({
			original: this.originalModel,
			modified: this.modifiedModel,
		});

		addEventListener("resize", () => {
			this.editor?.layout();
		});

		this.editor.layout();

		const resultEditor = monaco.editor.create(
			contentEl.createDiv({
				cls: "monaco-editor-container",
			}),
			{
				value: "some text",
				language: "text/plain",
				readOnly: true,
				automaticLayout: true,
				theme: "vs-dark",
			}
		);

		const tools = contentEl.createDiv({
			cls: "syncthing-monaco-editor-tools",
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

		// TODO: to implement
	}

	async onClose() {
		this.editor?.dispose();
		this.originalModel.dispose();
		this.modifiedModel.dispose();
	}
}
