import { App, Modal } from 'obsidian';
import SyncthingConfigurationTestModal from '../components/syncthing_configuration_test_modal.svelte';
import SyncthingPlugin from 'src/main';

export class SyncthingRestTestModal extends Modal {
	component?: SyncthingConfigurationTestModal;
	constructor(app: App, public plugin: SyncthingPlugin) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		this.component = new SyncthingConfigurationTestModal({
			target: contentEl,
			props: {
				plugin: this.plugin,
			},
		});
	}

	onClose() {
		this.component?.$destroy();
		const { contentEl } = this;
		contentEl.empty();
	}
}
