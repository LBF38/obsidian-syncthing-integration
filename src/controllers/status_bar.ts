import { App, Menu, Notice, TFile } from "obsidian";
import SyncthingPlugin from "src/main";
import { Failure } from "src/models/failures";
import { isConflictFilename, parseConflictFilename } from "./utils";

export class SyncthingStatusBar {
	app: App;
	activeConflicts?: TFile[];
	currentFile: TFile | null;
	originalFile?: TFile;
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
			if (this.currentFile && isConflictFilename(this.currentFile.name) && this.originalFile === undefined) {
				const file = this.currentFile;
				menu.addItem((item) => {
					item.setTitle("Rename to original").onClick(async () => {
						const conflict = parseConflictFilename(file.name);
						if (conflict instanceof Failure) {
							new Notice("Failed to parse conflict filename");
							console.error(conflict.message);
							return;
						}
						new Notice("Not implemented yet");
						// this.app.fileManager.renameFile(file, conflict.filename);
						// if (await this.app.vault.adapter.exists(normalizePath(file.name))) {
						// 	new Notice("File with original name already exists");
						// 	await this.app.vault.delete(this.app.vault.getAbstractFileByPath(normalizePath(file.name)) as TFile, true);
						// 	new Notice("Deleted original file");
						// 	// return;
						// }
						// await this.app.vault.adapter.rename(normalizePath(`${conflict.filename}.${conflict.extension}`), normalizePath(file.name));
						// new Notice("Renamed conflict to original");
					})
					item.setIcon("pencil");
				})
			}
			if (this.originalFile !== undefined) {
				menu.addItem((item) => {
					item.setTitle("Open original file").onClick(async () => await this.app.workspace
						.createLeafBySplit(this.app.workspace.getLeaf())
						.openFile(this.originalFile as TFile))
					item.setIcon("arrow-up-right");
				});
			}
			menu.addSeparator();
			this.activeConflicts?.sort((a, b) => {
				const aProps = parseConflictFilename(a.basename);
				const bProps = parseConflictFilename(b.basename);
				if (aProps instanceof Failure || bProps instanceof Failure) {
					return 0;
				}
				if (aProps.dateTime > bProps.dateTime) {
					return -1;
				}
				if (aProps.dateTime < bProps.dateTime) {
					return 1;
				}
				return 0;
			})
			this.activeConflicts?.forEach((file) => {
				menu.addItem((item) => {
					if (isConflictFilename(file.basename)) {
						const conflict = parseConflictFilename(file.basename);
						if (conflict instanceof Failure) {
							return;
						}
						item.setTitle(`${conflict.filename} (caused by ${conflict.modifiedBy} on ${conflict.dateTime.toISOString().replace("T", " ").replace("Z", "")})`);
					}
					// item.setTitle(file.basename);
					item.setIcon("file");
					item.onClick(async () => {
						await this.app.workspace
							.createLeafBySplit(this.app.workspace.getLeaf())
							.openFile(file);
					});
				});
			});

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
		// Get all conflicting files + original file
		this.plugin.syncthingController.getConflictsWithOriginal(activeFile).then((result) => {
			this.activeConflicts = result.conflicts;
			this.activeConflicts.remove(activeFile);
			this.originalFile = result.originalFile;
			if (!this.activeConflicts || this.activeConflicts.length === 0) {
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
