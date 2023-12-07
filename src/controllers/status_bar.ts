import { App, Menu, Notice, TFile } from "obsidian";
import SyncthingPlugin from "src/main";
import { Failure } from "src/models/failures";
import { isConflictFilename, parseConflictFilename } from "./utils";

export class SyncthingStatusBar {
	app: App;
	activeConflicts?: TFile[];
	currentFile: TFile | null;
	constructor(public status_bar: HTMLElement, public plugin: SyncthingPlugin) {
		this.app = plugin.app;
		this.currentFile = this.app.workspace.getActiveFile();
	}

	onload() {
		this.createStatusBar();
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("file-open", (file) => {
				this.currentFile = file;
				this.createStatusBar();
			})
		);

		this.status_bar.onClickEvent((event) => {
			const menu = new Menu();
			menu.addItem((item) => {
				item.setTitle("Open all conflicts as splits").onClick(() => {
					this.activeConflicts?.forEach(async (file) => {
						await this.app.workspace.createLeafBySplit(this.app.workspace.getLeaf()).openFile(file);
					});
				});
				item.setIcon("arrow-up-right");
			})
			if (this.currentFile && isConflictFilename(this.currentFile.basename)) {
				menu.addItem((item) => {
					item.setTitle("Rename to original").onClick(() => {
						new Notice("Not implemented yet !");
						// TODO: add this feature.
						// TODO: get original file if it exists => see getDiffFiles in main_controller.ts
					})
					item.setIcon("pencil");
				})
			}
			menu.addSeparator();
			this.activeConflicts?.forEach((file) => {
				menu.addItem((item) => {
					// if (isConflictFilename(file.basename)) {
					// 	const conflict = parseConflictFilename(file.basename);
					// 	if (conflict instanceof Failure) {
					// 		return;
					// 	}
					// 	item.setTitle(`${conflict.dateTime.toISOString()} ${conflict.filename} - ${conflict.modifiedBy}`);
					// }
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

	createStatusBar() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			this.status_bar.empty();
			return;
		}
		this.plugin.syncthingController.getConflicts().then((conflicts) => {
			if (conflicts instanceof Failure) {
				console.error(conflicts); // TODO: refactor w/ logging framework
				return;
			}
			if (isConflictFilename(activeFile.basename)) {
				const conflictFilename = parseConflictFilename(activeFile.basename);
				if (conflictFilename instanceof Failure) {
					console.error(conflictFilename.message); // TODO: refactor w/ logging framework
					return;
				}
				this.activeConflicts = conflicts.get(conflictFilename.filename);
			} else {
				this.activeConflicts = conflicts.get(activeFile.basename);
			}
			if (!this.activeConflicts) {
				this.status_bar.empty();
				return;
			}
			this.status_bar.setText(
				`${this.activeConflicts.length} conflicts`
			);
		});
	}

	onunload() {
		this.status_bar.empty();
	}
}
