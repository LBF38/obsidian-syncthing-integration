import { App, Modal } from "obsidian";
import { mount, unmount } from "svelte";
import SyncthingGUI from "src/components/syncthing_gui.svelte";
import SyncthingPlugin from "src/main";

/**
 * Modal embedding the Syncthing Web GUI inside Obsidian.
 * It is an alternative to the reimplemented configuration view.
 * @extends Modal
 * @param app - The Obsidian App instance.
 * @param plugin - The Syncthing plugin instance.
 */
export class SyncthingGUIModal extends Modal {
	private components: Array<ReturnType<typeof mount>> = [];
	constructor(
		app: App,
		public plugin: SyncthingPlugin,
	) {
		super(app);
	}

	onOpen() {
		this.modalEl.style.width = "80%";
		this.modalEl.style.height = "80%";

		this.components.push(
			mount(SyncthingGUI, {
				target: this.contentEl,
				props: {
					plugin: this.plugin,
					height: "100%",
				},
			}),
		);
	}

	onClose() {
		const { contentEl } = this;
		this.components.forEach((component) => void unmount(component));
		contentEl.empty();
	}
}
