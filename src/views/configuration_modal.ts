import { type App, Modal } from "obsidian";
import ConfigurationTable from "src/components/configuration_table.svelte";
import type SyncthingPlugin from "src/main";
import { mount, unmount } from "svelte";

export class ConfigurationModal extends Modal {
	private components: Array<ReturnType<typeof mount>> = [];
	constructor(app: App, public plugin: SyncthingPlugin) {
		super(app);
	}

	async onOpen() {
		this.modalEl.style.width = "100%";
		this.modalEl.style.height = "100%";

		this.components.push(
			mount(ConfigurationTable, {
				target: this.contentEl,
				props: {
					parent: this,
				},
			})
		);
	}

	onClose() {
		const { contentEl } = this;
		this.components.forEach((component) => void unmount(component));
		contentEl.empty();
	}
}
