import TestEditor from "../components/test_editor.svelte";
import { App, Modal } from "obsidian";

export class TestModal extends Modal {
	private component: TestEditor;
	constructor(app: App) {
		super(app);
		this.component = new TestEditor({
			target: this.contentEl,
		});
		this.modalEl.style.width = "100%";
		this.modalEl.style.height = "100%";
	}
	onClose(): void {
		this.component.$destroy();
	}

	// async onOpen() {}
}
