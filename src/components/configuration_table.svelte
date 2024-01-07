<script lang="ts">
	import { useActor } from "@xstate/svelte";
	import { Notice } from "obsidian";
	import { ConfigurationModal } from "src/views/configuration_modal";
	import { derived } from "svelte/store";
	import ConfigurationItem from "./configuration_item.svelte";
	import FolderItem from "./folder_item.svelte";
	import { syncthingConfigurationMachine } from "./machines";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import RemoteItem from "./remote_item.svelte";
	import WarningMessage from "./warning_message.svelte";

	export let parent: ConfigurationModal;
	parent.titleEl.setText("Syncthing Configuration");
	parent.titleEl.style.textAlign = "center";

	let { snapshot } = useActor(syncthingConfigurationMachine, {
		input: {
			syncthingREST: parent.plugin.syncthingFromREST,
		},
	});
	snapshot.subscribe((data) => {
		console.log("snapshot: ", data);
	});
	const folders = derived(
		snapshot,
		($snapshot) => $snapshot.context.configuration?.folders ?? [],
	);
	const devices = derived(
		snapshot,
		($snapshot) => $snapshot.context.configuration?.devices ?? [],
	);
	const thisDevice = derived(devices, ($devices) => $devices[0]);
</script>

<WarningMessage
	message="The following configuration is not fully implemented yet. Some data aren't real-time and some controls are not implemented yet. It is mainly to reproduce the Syncthing GUI and then, real-time data and controls will be added."
/>

{#if $snapshot.matches("failure")}
	<WarningMessage
		title="Failed fetching Syncthing configuration"
		message="Something wrong happened. The configuration might not be correctly shown. Expect some errors."
	/>
{/if}

<!-- {#if restartRequired}
	TODO: make it change when configuration changes. (note for later)
	<WarningMessage
		message="The configuration has been saved but not activated. Syncthing must restart to activate the new configuration."
	>
		<button
			on:click={async () => {
				await parent.plugin.syncthingFromREST.restart();
				restartRequired = !restartRequired;
			}}
		>
			Restart
		</button>
	</WarningMessage>
{/if} -->

<div class="left">
	<div class="folder">
		<h2>Folders ({$folders.length})</h2>
		{#each $folders as folder}
			<FolderItem {folder} />
		{/each}
		<div class="controls">
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="pause" />
				<span>Pause All</span>
			</button>
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="refresh-cw" />
				<span>Rescan All</span>
			</button>
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="plus" />
				<span>Add Folder</span>
			</button>
		</div>
	</div>
</div>
<div class="right">
	<div class="mydevice">
		<h2>This Device</h2>
		<ConfigurationItem isThisDevice device={$thisDevice} />
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
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="pause" />
				<span>Pause All</span>
			</button>
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="info" />
				<span>Recent Changes</span>
			</button>
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
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
