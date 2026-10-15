/**
 * Minimal runtime mock of the `obsidian` module.
 *
 * The real `obsidian` npm package only ships type definitions (`"main": ""`),
 * so the module cannot be imported at runtime outside of the Obsidian app.
 * This mock is aliased to `obsidian` by `vitest.config.ts` so that the plugin
 * code and the tests can run inside a standard Node / DOM environment.
 *
 * Only the subset of the API that the plugin actually uses is implemented.
 * Every function used for spying (`requestUrl`, `getIcon`, ...) is a `vi.fn()`
 * so tests can assert on it or override its behaviour.
 */
import { vi } from "vitest";

/* -------------------------------------------------------------------------- */
/*                                 Platform                                   */
/* -------------------------------------------------------------------------- */

/**
 * `Platform` is a plain object in the mock (instead of read-only getters) so
 * tests can freely toggle the flags. `test/setup.ts` restores the defaults
 * after each test.
 */
export const Platform = {
	isDesktop: true,
	isDesktopApp: true,
	isMobile: false,
	isMobileApp: false,
	isIosApp: false,
	isAndroidApp: false,
	isPhone: false,
	isTablet: false,
	isMacOS: false,
	isWin: false,
	isLinux: true,
	isSafari: false,
};

/* -------------------------------------------------------------------------- */
/*                             Files & vaults                                 */
/* -------------------------------------------------------------------------- */

export class TAbstractFile {
	vault!: Vault;
	path = "";
	name = "";
	parent!: TFolder | null;
}

export class TFile extends TAbstractFile {
	stat!: { ctime: number; mtime: number; size: number };
	basename = "";
	extension = "";
}

export class TFolder extends TAbstractFile {
	children: TAbstractFile[] = [];
	isRoot(): boolean {
		return this.path === "/";
	}
}

export class Vault {
	getFiles = vi.fn((): TFile[] => []);
	getMarkdownFiles = vi.fn((): TFile[] => []);
	getAllLoadedFiles = vi.fn((): TAbstractFile[] => []);
	getAbstractFileByPath = vi.fn((_path: string): TAbstractFile | null => null);
	getFileByPath = vi.fn((_path: string): TFile | null => null);
	create = vi.fn(async (path: string, _data: string): Promise<TFile> => {
		const file = new TFile();
		file.path = path;
		file.name = path.split("/").pop() ?? path;
		return file;
	});
	delete = vi.fn(async (_file: TAbstractFile): Promise<void> => undefined);
	adapter = { exists: vi.fn(async () => false), rename: vi.fn(async () => undefined) };
}

export class App {
	vault = new Vault();
	workspace = {
		getActiveFile: vi.fn((): TFile | null => null),
		getLeaf: vi.fn(),
		on: vi.fn(),
	};
	fileManager = {};
}

export class Plugin {
	app!: App;
	manifest = { id: "", name: "", version: "0.0.0" };
	constructor(app: App, _manifest?: unknown) {
		this.app = app;
	}
	onload(): void {}
	onunload(): void {}
	addCommand = vi.fn();
	addRibbonIcon = vi.fn(() => document.createElement("div"));
	addStatusBarItem = vi.fn(() => document.createElement("div"));
	addSettingTab = vi.fn();
	registerEvent = vi.fn();
	registerInterval = vi.fn(() => 0);
	async loadData<T = unknown>(): Promise<T | null> {
		return null;
	}
	async saveData(_data: unknown): Promise<void> {}
}

/* -------------------------------------------------------------------------- */
/*                                   Modals                                   */
/* -------------------------------------------------------------------------- */

export class Modal {
	app: App;
	containerEl: HTMLElement;
	modalEl: HTMLElement;
	titleEl: HTMLElement;
	contentEl: HTMLElement;
	constructor(app: App) {
		this.app = app;
		this.containerEl = document.createElement("div");
		this.modalEl = this.containerEl.createEl("div");
		this.titleEl = this.modalEl.createDiv();
		this.contentEl = this.modalEl.createDiv();
	}
	open(): void {
		this.onOpen();
	}
	close(): void {
		this.onClose();
		this.containerEl.detach();
	}
	onOpen(): void {}
	onClose(): void {}
}

/* -------------------------------------------------------------------------- */
/*                          Settings & UI components                          */
/* -------------------------------------------------------------------------- */

export class ToggleComponent {
	toggleEl: HTMLInputElement;
	constructor(containerEl: HTMLElement) {
		this.toggleEl = document.createElement("input");
		this.toggleEl.type = "checkbox";
		containerEl.appendChild(this.toggleEl);
	}
	setValue(value: boolean): this {
		this.toggleEl.checked = value;
		return this;
	}
	getValue(): boolean {
		return this.toggleEl.checked;
	}
	setDisabled(disabled: boolean): this {
		this.toggleEl.disabled = disabled;
		return this;
	}
	onChange(callback: (value: boolean) => unknown): this {
		this.toggleEl.addEventListener("change", () =>
			callback(this.toggleEl.checked),
		);
		return this;
	}
}

export class ButtonComponent {
	buttonEl: HTMLButtonElement;
	constructor(containerEl: HTMLElement) {
		this.buttonEl = document.createElement("button");
		containerEl.appendChild(this.buttonEl);
	}
	setButtonText(text: string): this {
		this.buttonEl.setText(text);
		return this;
	}
	setCta(): this {
		this.buttonEl.addClass("mod-cta");
		return this;
	}
	setWarning(): this {
		this.buttonEl.addClass("mod-warning");
		return this;
	}
	setIcon(icon: string): this {
		this.buttonEl.setAttribute("data-icon", icon);
		return this;
	}
	setTooltip(tooltip: string): this {
		this.buttonEl.setAttribute("aria-label", tooltip);
		return this;
	}
	onClick(callback: (evt: MouseEvent) => unknown): this {
		this.buttonEl.addEventListener("click", (evt) => callback(evt));
		return this;
	}
}

export class DropdownComponent {
	selectEl: HTMLSelectElement;
	constructor(containerEl: HTMLElement) {
		this.selectEl = document.createElement("select");
		containerEl.appendChild(this.selectEl);
	}
	addOption(value: string, display: string): this {
		const option = document.createElement("option");
		option.value = value;
		option.text = display;
		this.selectEl.appendChild(option);
		return this;
	}
	addOptions(options: Record<string, string>): this {
		for (const [value, display] of Object.entries(options)) {
			this.addOption(value, display);
		}
		return this;
	}
	setValue(value: string): this {
		this.selectEl.value = value;
		return this;
	}
	getValue(): string {
		return this.selectEl.value;
	}
	onChange(callback: (value: string) => unknown): this {
		this.selectEl.addEventListener("change", () =>
			callback(this.selectEl.value),
		);
		return this;
	}
}

export class SliderComponent {
	sliderEl: HTMLInputElement;
	constructor(containerEl: HTMLElement) {
		this.sliderEl = document.createElement("input");
		this.sliderEl.type = "range";
		containerEl.appendChild(this.sliderEl);
	}
	setValue(value: number): this {
		this.sliderEl.value = String(value);
		return this;
	}
	getValue(): number {
		return Number(this.sliderEl.value);
	}
	setLimits(min: number, max: number, step: number | "any"): this {
		this.sliderEl.min = String(min);
		this.sliderEl.max = String(max);
		this.sliderEl.step = String(step);
		return this;
	}
	setDynamicTooltip(): this {
		return this;
	}
	onChange(callback: (value: number) => unknown): this {
		this.sliderEl.addEventListener("change", () =>
			callback(Number(this.sliderEl.value)),
		);
		return this;
	}
}

export class TextComponent {
	inputEl: HTMLInputElement;
	constructor(containerEl: HTMLElement) {
		this.inputEl = document.createElement("input");
		this.inputEl.type = "text";
		containerEl.appendChild(this.inputEl);
	}
	setValue(value: string): this {
		this.inputEl.value = value;
		return this;
	}
	getValue(): string {
		return this.inputEl.value;
	}
	setPlaceholder(placeholder: string): this {
		this.inputEl.placeholder = placeholder;
		return this;
	}
	onChange(callback: (value: string) => unknown): this {
		this.inputEl.addEventListener("change", () =>
			callback(this.inputEl.value),
		);
		return this;
	}
}

export class Setting {
	settingEl: HTMLElement;
	infoEl: HTMLElement;
	nameEl: HTMLElement;
	descEl: HTMLElement;
	controlEl: HTMLElement;
	components: unknown[] = [];

	constructor(containerEl: HTMLElement) {
		this.settingEl = containerEl.createDiv({ cls: "setting-item" });
		this.infoEl = this.settingEl.createDiv({ cls: "setting-item-info" });
		this.nameEl = this.infoEl.createDiv({ cls: "setting-item-name" });
		this.descEl = this.infoEl.createDiv({ cls: "setting-item-description" });
		this.controlEl = this.settingEl.createDiv({
			cls: "setting-item-control",
		});
	}

	setName(name: string): this {
		this.nameEl.setText(name);
		return this;
	}
	setDesc(desc: string): this {
		this.descEl.setText(desc);
		return this;
	}
	setHeading(): this {
		this.settingEl.addClass("setting-item-heading");
		return this;
	}
	setClass(cls: string): this {
		this.settingEl.addClass(cls);
		return this;
	}
	addButton(callback: (button: ButtonComponent) => unknown): this {
		const button = new ButtonComponent(this.controlEl);
		this.components.push(button);
		callback(button);
		return this;
	}
	addToggle(callback: (toggle: ToggleComponent) => unknown): this {
		const toggle = new ToggleComponent(this.controlEl);
		this.components.push(toggle);
		callback(toggle);
		return this;
	}
	addDropdown(callback: (dropdown: DropdownComponent) => unknown): this {
		const dropdown = new DropdownComponent(this.controlEl);
		this.components.push(dropdown);
		callback(dropdown);
		return this;
	}
	addSlider(callback: (slider: SliderComponent) => unknown): this {
		const slider = new SliderComponent(this.controlEl);
		this.components.push(slider);
		callback(slider);
		return this;
	}
	addText(callback: (text: TextComponent) => unknown): this {
		const text = new TextComponent(this.controlEl);
		this.components.push(text);
		callback(text);
		return this;
	}
}

/* -------------------------------------------------------------------------- */
/*                                   Menu                                     */
/* -------------------------------------------------------------------------- */

export class MenuItem {
	title = "";
	icon = "";
	private clickHandler?: () => unknown;
	setTitle(title: string): this {
		this.title = title;
		return this;
	}
	setIcon(icon: string): this {
		this.icon = icon;
		return this;
	}
	onClick(handler: () => unknown): this {
		this.clickHandler = handler;
		return this;
	}
	/** Test helper: trigger the registered click handler. */
	trigger(): void {
		this.clickHandler?.();
	}
}

export class Menu {
	items: MenuItem[] = [];
	separators = 0;
	addItem(callback: (item: MenuItem) => unknown): this {
		const item = new MenuItem();
		this.items.push(item);
		callback(item);
		return this;
	}
	addSeparator(): this {
		this.separators++;
		return this;
	}
	showAtPosition(_position: unknown): this {
		return this;
	}
}

/* -------------------------------------------------------------------------- */
/*                                   Notice                                   */
/* -------------------------------------------------------------------------- */

export class Notice {
	message: string | DocumentFragment;
	timeout?: number;
	static instances: Notice[] = [];
	constructor(message: string | DocumentFragment, timeout?: number) {
		this.message = message;
		this.timeout = timeout;
		Notice.instances.push(this);
	}
	setMessage(message: string | DocumentFragment): this {
		this.message = message;
		return this;
	}
	hide(): void {}
}

/* -------------------------------------------------------------------------- */
/*                             Icons & helpers                                */
/* -------------------------------------------------------------------------- */

export const getIcon = vi.fn((_name: string): SVGSVGElement | null => null);
export const addIcon = vi.fn(
	(_name: string, _svg: string): void => undefined,
);

export function normalizePath(path: string): string {
	return path
		.replace(/\\/g, "/")
		.replace(/\/{2,}/g, "/")
		.replace(/^\.\//, "");
}

export function debounce<T extends unknown[]>(
	callback: (...args: T) => unknown,
	timeout: number,
	resetTimer = false,
): ((...args: T) => void) & { cancel(): void } {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const debounced = (...args: T): void => {
		if (resetTimer && timer !== undefined) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => callback(...args), timeout);
	};
	debounced.cancel = (): void => {
		if (timer !== undefined) {
			clearTimeout(timer);
		}
	};
	return debounced;
}

/* -------------------------------------------------------------------------- */
/*                                  REST                                       */
/* -------------------------------------------------------------------------- */

/**
 * Mock of Obsidian's `requestUrl`. Tests override it with
 * `vi.mocked(requestUrl).mockResolvedValueOnce(...)`.
 */
export const requestUrl = vi.fn();

/* -------------------------------------------------------------------------- */
/*                              Suggestions                                   */
/* -------------------------------------------------------------------------- */

export abstract class AbstractInputSuggest<T> {
	constructor(
		public app: App,
		public inputEl: HTMLInputElement,
	) {}
	abstract getSuggestions(query: string): T[] | Promise<T[]>;
	setValue(_value: string): void {}
	close(): void {}
	onSelect(
		_callback: (value: T, evt: MouseEvent | KeyboardEvent) => unknown,
	): this {
		return this;
	}
}
