<script lang="ts">
	import { Notice } from "obsidian";
	import { derived } from "svelte/store";
	import { onMount } from "svelte";
	import { type ConfigurationModal } from "src/views/configuration_modal";
	import ConfigurationItem from "./configuration_item.svelte";
	import FolderItem from "./folder_item.svelte";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import RemoteItem from "./remote_item.svelte";
	import {
		refreshSyncthingData,
		syncthingConfiguration,
		syncthingSystemStatus,
	} from "./stores";
	import WarningMessage from "./warning_message.svelte";

	export let parent: ConfigurationModal;
	parent.titleEl.setText("Syncthing Configuration");
	parent.titleEl.style.textAlign = "center";

	let error: string | undefined = undefined;

	const folders = derived(
		syncthingConfiguration,
		($configuration) => $configuration?.folders ?? [],
	);
	const devices = derived(
		syncthingConfiguration,
		($configuration) => $configuration?.devices ?? [],
	);
	const thisDevice = derived(
		[devices, syncthingSystemStatus],
		([$devices, $systemStatus]) =>
			$devices.find((device) => device.deviceID === $systemStatus?.myID),
	);

	async function refresh() {
		error = undefined;
		try {
			await refreshSyncthingData(parent.plugin.syncthingFromREST);
		} catch (e) {
			console.error("Failed to fetch the Syncthing configuration.", e);
			error = e instanceof Error ? e.message : String(e);
			new Notice("Failed to fetch the Syncthing configuration.");
		}
	}

	onMount(refresh);
</script>

<WarningMessage
	message="The following configuration is not fully implemented yet. Some data aren't real-time and some controls are not implemented yet. It is mainly to reproduce the Syncthing GUI and then, real-time data and controls will be added."
/>

{#if error}
	<WarningMessage title="An error occurred" message={error}>
		<button on:click={refresh}> Retry </button>
	</WarningMessage>
{/if}

<div class="left">
	<div class="folder">
		<h2>Folders ({$folders.length})</h2>
		{#each $folders as folder}
			<FolderItem {folder} />
		{/each}
		<div class="controls">
			<button on:click={() => new Notice("Not implemented yet!")}>
				<ObsidianLucideIcon name="pause" />
				<span>Pause All</span>
			</button>
			<button on:click={() => new Notice("Not implemented yet!")}>
				<ObsidianLucideIcon name="refresh-cw" />
				<span>Rescan All</span>
			</button>
			<button on:click={() => new Notice("Not implemented yet!")}>
				<ObsidianLucideIcon name="plus" />
				<span>Add Folder</span>
			</button>
		</div>
	</div>
</div>
<div class="right">
	<div class="mydevice">
		<h2>This Device</h2>
		{#if $thisDevice}
			<ConfigurationItem isThisDevice device={$thisDevice} />
		{/if}
	</div>
	<div class="remote">
		<h2>
			Remote Devices ({$devices.filter((value) => value !== $thisDevice)
				.length})
		</h2>
		{#each $devices.filter((value) => value !== $thisDevice) as device}
			<RemoteItem {device} />
		{/each}
		<div class="controls">
			<button on:click={() => new Notice("Not implemented yet!")}>
				<ObsidianLucideIcon name="pause" />
				<span>Pause All</span>
			</button>
			<button on:click={() => new Notice("Not implemented yet!")}>
				<ObsidianLucideIcon name="info" />
				<span>Recent Changes</span>
			</button>
			<button on:click={() => new Notice("Not implemented yet!")}>
				<ObsidianLucideIcon name="plus" />
				<span>Add Remote Device</span>
			</button>
		</div>
	</div>
</div>

<style>
	.left {
		float: left;
		width: 50%;
	}
	.right {
		float: right;
		width: 50%;
	}
	.folder,
	.mydevice,
	.remote {
		width: 100%;
	}
	.controls {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		margin: 1em 0;
	}
	.controls button {
		gap: 0.5em;
		margin: 0 0.5em;
	}
</style>
