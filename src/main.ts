import {
	App,
	Editor,
	ItemView,
	MarkdownFileInfo,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TAbstractFile,
	TFile,
	WorkspaceLeaf,
} from "obsidian";
import { createTwoFilesPatch } from "diff";
import { defaultDiff2HtmlConfig, html } from "diff2html";

//! Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	myToggleSetting: boolean;
	excludedFolders: boolean[];
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
	myToggleSetting: false,
	excludedFolders: [false],
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"cloud",
			"OneDrive Sync",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("OneDrive Sync is not yet implemented.");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("OneDrive Sync status");
		statusBarItemEl.onClickEvent(() => {
			new Notice("OneDrive Sync is not yet implemented.");
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-onedrive-sync-modal",
			name: "Open OneDrive Sync modal",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (
				editor: Editor,
				ctx: MarkdownView | MarkdownFileInfo
			) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);

		// Example of a custom view
		this.registerView(VIEW_TYPE_EXAMPLE, (leaf) => new ExampleView(leaf));

		this.addRibbonIcon("dice", "Activate view", () => {
			const file = this.app.vault.getFiles()[0];
			this.activateView(file);
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView(file: TFile) {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

		await this.app.workspace.getLeaf("split").setViewState({
			type: VIEW_TYPE_EXAMPLE,
			state: this.app.vault.read(file),
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
		);
	}
}

class SampleModal extends Modal {
	text2display: string;
	constructor(app: App, text2display?: string) {
		super(app);
		this.text2display = text2display ? text2display : "";
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Welcome to OneDrive Sync!");
		contentEl.innerHTML += this.text2display;
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "SyncThing" });
		new Setting(containerEl)
			.setName("Connecting to SyncThing")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.myToggleSetting)
					.onChange(async (value) => {
						console.log("Toggle: " + value);
						this.plugin.settings.myToggleSetting = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Exclude files")
			.setDesc("Files to exclude from sync")
			.addButton((button) =>
				button.setButtonText("Add").onClick(() => {
					new Notice("Button pressed");
					console.log("Button pressed");
				})
			);
		const all_files: TAbstractFile[] = this.app.vault.getAllLoadedFiles();
		for (let k = 0; k < all_files.length; k++) {
			const abstract_files = all_files[k];
			if (abstract_files.name === "") continue;
			const input = containerEl.createEl("input", {
				type: "checkbox",
				attr: { id: abstract_files.name, name: abstract_files.name },
				title: abstract_files.name,
			});
			containerEl
				.createEl("label", {
					text: abstract_files.name,
					value: abstract_files.name,
					attr: { for: abstract_files.name },
				})
				.appendChild(containerEl.createEl("br"));
			if (abstract_files instanceof TFile) {
				input.style.textIndent = "50px";
			}
		}
	}
}

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example view";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Example view" });
		this.contentEl.setText("Hello world!");
		this.contentEl.createEl("h1", { text: "Hello world!" });
		const file1 = {
			tfile: this.app.vault.getMarkdownFiles()[0],
			content: await this.app.vault.read(
				this.app.vault.getMarkdownFiles()[0]
			),
		};
		const file2 = {
			tfile: this.app.vault.getMarkdownFiles()[1],
			content: await this.app.vault.read(
				this.app.vault.getMarkdownFiles()[1]
			),
		};
		this.contentEl.createEl("h1", { text: file1.tfile.basename });
		this.contentEl.createDiv({ text: file1.content });
		this.contentEl.createEl("h1", { text: file2.tfile.basename });
		this.contentEl.createDiv({ text: file2.content });
		this.containerEl
			.createEl("button", { text: "Diff" })
			.addEventListener("click", () => {
				createTwoFilesPatch(
					file1.tfile.basename,
					file2.tfile.basename,
					file1.content,
					file2.content
				);
			});
		const difference = createTwoFilesPatch(
			file1.tfile.basename,
			file2.tfile.basename,
			file1.content,
			file2.content
		);
		this.contentEl.createEl("h1", { text: "Difference" });
		this.contentEl.createDiv({ text: difference });
		this.contentEl
			.createEl("button", { text: "Open diff between files" })
			.addEventListener("click", () => {
				new SampleModal(app, html(difference, defaultDiff2HtmlConfig)).open();
			});
	}

	async onClose() {
		// Nothing to clean up.
	}
}

export class ExampleMarkdownView extends MarkdownView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example markdown view";
	}

	async onOpen() {
		const file = this.app.vault.getMarkdownFiles()[0];
		this.contentEl.setText(await this.app.vault.read(file));
		this.leaf
			.getContainer()
			.doc.createElement("h4")
			.setText("Example markdown view");
		// const container = this.containerEl.children[1];
		// container.empty();
		// container.createEl("h4", { text: "Example markdown view" });
	}

	async onClose() {
		// Nothing to clean up.
	}
}
