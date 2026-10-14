import { SyncthingConfiguration } from "src/models/entities";
import { UnionSyncthingEvents } from "src/models/syncthing_events";
import { writable } from "svelte/store";
import { Output } from "valibot";
export const syncthingConfiguration =
	writable<Output<typeof SyncthingConfiguration>>(undefined);
export const syncthingEvents =
	writable<Output<typeof UnionSyncthingEvents>>(undefined);
