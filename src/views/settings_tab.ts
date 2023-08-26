import { App, PluginSettingTab } from "obsidian";
import { type SyncthingController } from "src/controllers/main_controller";
import SyncthingPlugin from "src/main";
import SettingView from "../components/settings_view.svelte";

export class SyncthingSettingTab extends PluginSettingTab {
	plugin: SyncthingPlugin;
	syncthingController: SyncthingController;

	constructor(app: App, plugin: SyncthingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.syncthingController = plugin.syncthingController;
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();

		new SettingView({
			target: containerEl,
			props: {
				parent: this,
			},
		});
	}
}
