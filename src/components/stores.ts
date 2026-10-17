import { type SyncthingFromREST } from "src/data/syncthing_remote_datasource";
import { SyncthingConfiguration, SyncthingSystemStatus } from "src/models/entities";
import { writable } from "svelte/store";
import { Output } from "valibot";

export type SyncthingConfigurationData = Output<typeof SyncthingConfiguration>;
export type SyncthingSystemStatusData = Output<typeof SyncthingSystemStatus>;

/**
 * The current Syncthing configuration, as returned by the `/rest/config` endpoint.
 */
export const syncthingConfiguration = writable<
	SyncthingConfigurationData | undefined
>(undefined);

/**
 * The current Syncthing system status, as returned by the `/rest/system/status` endpoint.
 * It is notably used to identify "this device" by its device ID.
 */
export const syncthingSystemStatus = writable<
	SyncthingSystemStatusData | undefined
>(undefined);

/**
 * Fetch the Syncthing configuration and system status, then update the stores.
 * This is used to display the Syncthing configuration inside Obsidian.
 * @param syncthingREST - The Syncthing REST datasource.
 */
export async function refreshSyncthingData(
	syncthingREST: SyncthingFromREST,
): Promise<void> {
	const [configuration, systemStatus] = await Promise.all([
		syncthingREST.config.all(),
		syncthingREST.system.status(),
	]);
	syncthingConfiguration.set(configuration);
	syncthingSystemStatus.set(systemStatus);
}
