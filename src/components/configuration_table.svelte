<script lang="ts">
	import { ConfigurationModal } from "src/views/configuration_modal";
	import ConfigurationItem from "./configuration_item.svelte";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import FolderItem from "./folder_item.svelte";
	import { Notice } from "obsidian";
	import RemoteItem from "./remote_item.svelte";

	export let parent: ConfigurationModal;
	parent.titleEl.setText("Syncthing Configuration");
	parent.titleEl.style.textAlign = "center";

	let syncthingBaseUrl = `${parent.plugin.settings.configuration.url?.protocol}://${parent.plugin.settings.configuration.url?.ip_address}:${parent.plugin.settings.configuration.url?.port}/}`;
	console.log(syncthingBaseUrl);
</script>

<div class="left">
	<div class="folder">
		<h2>Folders (#)</h2>
		<FolderItem name="Folder #1" />
		<FolderItem name="Folder #2" />
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
		<ConfigurationItem />
	</div>
	<div class="remote">
		<h2>Remote Devices (#)</h2>
		<RemoteItem name="Remote #1" />
		<RemoteItem name="Remote #2" />
		<RemoteItem name="Remote #3" />
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
	/* your styles go here */
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
