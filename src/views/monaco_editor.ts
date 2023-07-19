import { App, Modal } from "obsidian";
import * as monaco from "monaco-editor";

/**
 * Modal to display the Monaco Editor for the user to edit files that are in conflict.
 */
export class MonacoEditorModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;
		const containerEl = contentEl.createDiv();

		const originalModel = monaco.editor.createModel(
			/* set from `originalModel`: */ `hello world`,
			"text/plain"
		);
		const modifiedModel = monaco.editor.createModel(
			/* set from `modifiedModel`: */ `Hello World!`,
			"text/plain"
		);

		const diffEditor = monaco.editor.createDiffEditor(containerEl, {
			readOnly: true,
			automaticLayout: true,
			renderSideBySide: false,
		});
		diffEditor.setModel({
			original: originalModel,
			modified: modifiedModel,
		});

		addEventListener("resize", () => {
			diffEditor.layout();
		});
		diffEditor.layout();
		contentEl.style.height = "50em";
		contentEl.style.width = "50em";

		// TODO: to implement
	}

	async onClose() {
		// TODO: clean up
	}
}
