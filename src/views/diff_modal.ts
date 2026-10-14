import { App, Modal, Notice, TFile } from "obsidian";
import { mount, unmount } from "svelte";
import { type SyncthingController } from "src/controllers/main_controller";
import { type ConflictFilename } from "src/models/entities";
import { Failure } from "src/models/failures";
import DiffView from "../components/diff_view.svelte";

export class DiffModal extends Modal {
	d2hUI?: string;
	d2hColorBlind = false;
	originalFile: TFile;
	conflictingFiles: TFile[] = [];
	conflictingFilesOrFailure: TFile[] | Failure = [];
	conflictingFilesProperties: Map<TFile, ConflictFilename | Failure>;
	private component?: ReturnType<typeof mount>;
	constructor(
		app: App,
		public file: TFile,
		public syncthingController: SyncthingController
	) {
		super(app);
		this.originalFile = file;
		this.conflictingFilesProperties = new Map();
	}

	async onOpen() {
		this.modalEl.style.width = "100%";
		this.modalEl.style.height = "100%";
		({
			originalFile: this.originalFile,
			conflictingFiles: this.conflictingFilesOrFailure,
			conflictingFilesProperties: this.conflictingFilesProperties,
		} = await this.syncthingController.getDiffFiles(this.file));

		if (this.conflictingFilesOrFailure instanceof Failure) {
			new Notice(this.conflictingFilesOrFailure.message);
			this.close();
			return;
		}
		this.conflictingFiles = this.conflictingFilesOrFailure;

		this.component = mount(DiffView, {
			target: this.contentEl,
			props: {
				parentModal: this,
			},
		});
	}

	onClose() {
		const { contentEl } = this;
		if (this.component) void unmount(this.component);
		contentEl.empty();
	}
}
