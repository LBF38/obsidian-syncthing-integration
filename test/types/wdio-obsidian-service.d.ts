import type SyncthingPlugin from "../../src/main";

declare module "wdio-obsidian-service" {
	interface InstalledPlugins {
		syncthingIntegration: SyncthingPlugin;
	}
}
