import { createTwoFilesPatch } from "diff";
import { html } from "diff2html";
import { App, Modal, Plugin, TFile } from "obsidian";

export default class SyncThingPlugin extends Plugin {
	async onload() {
		console.log("SyncThing plugin loaded!");

		// Register a command to show the list of conflicting files
		this.addCommand({
			id: "show-conflicting-files",
			name: "Show Conflicting Files",
			callback: () => {
				this.showConflictingFiles();
			},
		});

		this.addRibbonIcon("wrench", "Show Conflict Files", () => {
			new ConflictFilesModal(this.app).open();
		});

		// Add a toolbar icon to show the list of conflicting files
		this.addRibbonIcon("cloud", "Show Conflicting Files", () => {
			this.showConflictingFiles();
		});
	}

	async showConflictingFiles() {
		// Get the list of conflicting files from your SyncThing API
		const conflictingFiles: TFile[] = this.app.vault
			.getFiles()
			.filter((file) => {
				return file;
			});

		// Create a new modal to show the conflicting files
		const modal = new Modal(this.app);
		modal.titleEl.setText("Conflicting Files");

		// Create a new list element to show the conflicting files
		const listEl = modal.contentEl.createEl("ul");
		listEl.classList.add("sync-thing-conflicting-files");

		// Add each conflicting file to the list
		for (const file of conflictingFiles) {
			const listItemEl = modal.contentEl.createEl("li");
			listItemEl.classList.add("sync-thing-conflicting-file");

			const linkEl = modal.contentEl.createEl("a");
			linkEl.innerText = file.basename;
			linkEl.href = `#${file.path}`;

			// When the user clicks on a link, show the conflicting file in a new tab
			linkEl.onclick = (event) => {
				event.preventDefault();
				this.app.workspace.openLinkText(file.path, "", true, {
					active: true,
				});
			};

			listItemEl.appendChild(linkEl);
			listEl.appendChild(listItemEl);
		}

		modal.open();
	}
}

class ConflictFilesModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Conflict Files" }).addClass("modal-title");
		contentEl.addClass("conflict-view");
		// Second column with diff of selected file
		const diffView = contentEl.createEl("div", { cls: "diff-view" });

		// Third column with full content of selected file
		const fileView = contentEl.createEl("div", { cls: "file-view" });

		// First column with list of files
		const filesList = contentEl.createEl("div", { cls: "files-list" });
		const originalFile = this.app.vault.getFiles()[0];
		const files = this.app.vault.getFiles().slice(1, -1);
		for (const file of files) {
			const fileEl = filesList.createEl("div", { text: file.name });
			fileEl.addEventListener("click", () => {
				this.showFileDiff(originalFile, file, diffView, fileView);
			});
		}
	}

	private async showFileDiff(
		originalFile: TFile,
		conflictingFile: TFile,
		diffView: HTMLElement,
		fileView: HTMLElement
	) {
		// Load the two versions of the file
		const originalContent = await app.vault.read(originalFile);
		const conflictingContent = await app.vault.read(conflictingFile);

		// Compute the diff between the two files
		const diff = createTwoFilesPatch(
			originalFile.basename,
			conflictingFile.basename,
			originalContent,
			conflictingContent
		);

		// Display the diff in the second column
		diffView.innerHTML = html(diff);

		// Display the full content of the file in the third column
		fileView.setText(originalContent);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
