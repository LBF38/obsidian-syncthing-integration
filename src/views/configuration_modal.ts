import { App, Modal } from "obsidian";
import ConfigurationTable from "src/components/configuration_table.svelte";
import SyncthingPlugin from "src/main";
import { SvelteComponent } from "svelte";

export class ConfigurationModal extends Modal {
	private components: SvelteComponent[] = [];
	constructor(app: App, public plugin: SyncthingPlugin) {
		super(app);
	}

	async onOpen() {
		this.modalEl.style.width = "100%";
		this.modalEl.style.height = "100%";

		this.components.push(
			new ConfigurationTable({
				target: this.contentEl,
				props: {
					parent: this,
				},
			})
		);
	}

	onClose() {
		const { contentEl } = this;
		this.components.forEach((component) => component.$destroy());
		contentEl.empty();
	}
}
