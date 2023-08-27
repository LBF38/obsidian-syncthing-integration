<script lang="ts">
	import { Notice } from "obsidian";
	import { SyncthingDevice, SyncthingFolder } from "src/models/entities";
	import { ConfigurationModal } from "src/views/configuration_modal";
	import { onMount } from "svelte";
	import ConfigurationItem from "./configuration_item.svelte";
	import FolderItem from "./folder_item.svelte";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import RemoteItem from "./remote_item.svelte";
	import WarningMessage from "./warning_message.svelte";
	import { Output } from "valibot";

	export let parent: ConfigurationModal;
	parent.titleEl.setText("Syncthing Configuration");
	parent.titleEl.style.textAlign = "center";

	let syncthingBaseUrl = `${parent.plugin.settings.url?.protocol}://${parent.plugin.settings.url?.ip_address}:${parent.plugin.settings.url?.port}/`;
	console.log(syncthingBaseUrl);
	// TODO: refactor this to use Svelte stores.
	let folders: Output<typeof SyncthingFolder>[] = [];
	let devices: Output<typeof SyncthingDevice>[] = [];
	let thisDevice: Output<typeof SyncthingDevice> | undefined = undefined;
	let restartRequired = false;
	onMount(async () => {
		folders = await parent.plugin.syncthingController.getFolders();
		devices = await parent.plugin.syncthingController.getDevices();
		restartRequired =
			await parent.plugin.syncthingFromREST.isRestartRequired();
		thisDevice = devices.first();
		console.log("Folders: ", folders);
		console.log("Devices: ", devices);
	});
</script>

<WarningMessage
	message="The following configuration is not fully implemented yet. Some data aren't real-time and some controls are not implemented yet. It is mainly to reproduce the Syncthing GUI and then, real-time data and controls will be added."
/>

{#if restartRequired}
	<!-- TODO: make it change when configuration changes. (note for later) -->
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
{/if}

<div class="left">
	<div class="folder">
		<h2>Folders ({folders.length})</h2>
		{#each folders as folder}
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
		<ConfigurationItem isThisDevice device={thisDevice} />
	</div>
	<div class="remote">
		<h2>
			Remote Devices ({devices.filter((value) => value !== thisDevice)
				.length})
		</h2>
		{#each devices.filter((value) => value !== thisDevice) as device}
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
