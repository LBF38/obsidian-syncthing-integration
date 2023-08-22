<script lang="ts">
	import { Notice } from "obsidian";
	import { SyncthingDevice, SyncthingFolder } from "src/models/entities";
	import { ConfigurationModal } from "src/views/configuration_modal";
	import { onMount } from "svelte";
	import ConfigurationItem from "./configuration_item.svelte";
	import FolderItem from "./folder_item.svelte";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import RemoteItem from "./remote_item.svelte";

	export let parent: ConfigurationModal;
	parent.titleEl.setText("Syncthing Configuration");
	parent.titleEl.style.textAlign = "center";

	let syncthingBaseUrl = `${parent.plugin.settings.configuration.url?.protocol}://${parent.plugin.settings.configuration.url?.ip_address}:${parent.plugin.settings.configuration.url?.port}/`;
	console.log(syncthingBaseUrl);
	// TODO: refactor this to use Svelte stores.
	let folders: SyncthingFolder[] = [];
	let devices: SyncthingDevice[] = [];
	let thisDevice: SyncthingDevice | undefined = undefined;
	onMount(async () => {
		folders = await parent.plugin.syncthingController.getFolders();
		devices = await parent.plugin.syncthingController.getDevices();
		thisDevice = devices.first();
		console.log("Folders: ", folders);
		console.log("Devices: ", devices);
	});
</script>

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
