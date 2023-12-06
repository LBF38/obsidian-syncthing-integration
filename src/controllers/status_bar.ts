import { App, Menu, TFile } from "obsidian";
import SyncthingPlugin from "src/main";
import { Failure } from "src/models/failures";

export class SyncthingStatusBar {
	app: App;
	activeConflicts?: TFile[];
	constructor(public status_bar: HTMLElement, public plugin: SyncthingPlugin) {
		this.app = plugin.app;
	}

	onload() {
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("file-open", () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					this.status_bar.empty();
					return;
				}
				this.plugin.syncthingController.getConflicts().then((conflicts) => {
					if (conflicts instanceof Failure) {
						return;
					}
					this.activeConflicts = conflicts.get(activeFile.basename);
					if (!this.activeConflicts) {
						this.status_bar.empty();
						return;
					}
					this.status_bar.setText(
						`${this.activeConflicts.length} conflicts`
					);
				});
			})
		);

		this.status_bar.onClickEvent((event) => {
			const menu = new Menu();
			menu.addItem((item) => {
				item.setTitle("Open all conflicts").onClick(() => {
					this.activeConflicts?.forEach(async (file) => {
						await this.app.workspace.createLeafBySplit(this.app.workspace.getLeaf()).openFile(file);
					});
				});
				item.setIcon("arrow-up-right");
			})
			menu.addItem((item) => {
				item.setTitle("Rename to original").onClick(() => {
					console.log("TODO: add feature");// TODO: add this feature.
				})
				item.setIcon("pencil");
			})
			menu.addSeparator();
			this.activeConflicts?.forEach((file) => {
				menu.addItem((item) => {
					item.setTitle(file.basename);
					item.setIcon("file");
					item.onClick(async () => {
						await this.app.workspace
							.createLeafBySplit(this.app.workspace.getLeaf())
							.openFile(file);
					});
				});
			})

			menu.showAtPosition({
				x: window.innerWidth - 15, y: window.innerHeight - 37,
			})
		});

		// styling
		this.status_bar.addClass("mod-clickable");
		this.status_bar.style.color = "var(--text-warning)";
	}

	onunload() {
		this.status_bar.empty();
	}
}
