/**
 * Helpers to build a fake `SyncthingPlugin` instance for controller tests.
 *
 * Only the small surface used by `SyncthingController` is implemented: `app`
 * (with a `vault` returning a given list of files) and `settings`
 * (with a `saveSettings` spy).
 */
import { vi } from "vitest";
import type { App, TFile } from "obsidian";
import type SyncthingPlugin from "src/main";
import type { SyncthingURL } from "src/models/entities";

export interface FakePluginSettings {
	api_key?: string;
	gui_username?: string;
	gui_password?: string;
	url?: SyncthingURL;
	configuration?: unknown;
	devMode?: boolean;
	embedSyncthingGUI?: boolean;
}

/** A vault whose methods are Vitest mocks. */
export interface FakeVault {
	getFiles: ReturnType<typeof vi.fn>;
	getMarkdownFiles: ReturnType<typeof vi.fn>;
	getAllLoadedFiles: ReturnType<typeof vi.fn>;
	getAbstractFileByPath: ReturnType<typeof vi.fn>;
	create: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
}

export interface FakePlugin {
	app: App;
	vault: FakeVault;
	settings: FakePluginSettings;
	saveSettings: ReturnType<typeof vi.fn>;
	loadData: ReturnType<typeof vi.fn>;
	saveData: ReturnType<typeof vi.fn>;
}

export const DEFAULT_URL: SyncthingURL = {
	protocol: "http",
	ip_address: "localhost",
	port: 8384,
};

/**
 * Create a fake plugin whose vault returns the provided files.
 */
export function makePlugin(
	files: TFile[] = [],
	settings: FakePluginSettings = {},
): FakePlugin {
	const vault: FakeVault = {
		getFiles: vi.fn(() => files),
		getMarkdownFiles: vi.fn(() => files),
		getAllLoadedFiles: vi.fn(() => files),
		getAbstractFileByPath: vi.fn(() => null),
		create: vi.fn(async () => files[0]),
		delete: vi.fn(async () => undefined),
	};

	const app = {
		vault,
		workspace: {
			getActiveFile: vi.fn(() => files[0] ?? null),
			getLeaf: vi.fn(),
		},
	} as unknown as App;

	return {
		app,
		vault,
		settings: {
			api_key: "",
			url: { ...DEFAULT_URL },
			devMode: false,
			embedSyncthingGUI: false,
			...settings,
		},
		saveSettings: vi.fn(async () => undefined),
		loadData: vi.fn(async () => null),
		saveData: vi.fn(async () => undefined),
	};
}

/**
 * Cast a fake plugin to the real `SyncthingPlugin` type expected by the
 * controller and the data sources.
 */
export function asPlugin(plugin: FakePlugin): SyncthingPlugin {
	return plugin as unknown as SyncthingPlugin;
}
