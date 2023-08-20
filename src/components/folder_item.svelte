<script lang="ts">
	import { Notice } from "obsidian";
	import ConfigurationItem from "./configuration_item.svelte";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import { ConfigurationItemData } from "./types";
	import { SyncthingFolder } from "src/models/entities";
	export let folder: SyncthingFolder = {
		id: "folder ID",
		label: "folder label",
		path: "folder path",
		type: "sendreceive",
		devices: [
			{ deviceID: "device 1", encryptionPassword: "", introducedBy: "" },
			{ deviceID: "device 2", encryptionPassword: "", introducedBy: "" },
		],
		filesystemType: "filesystem type",
		maxConflicts: 0,
	};
	let data: ConfigurationItemData = [
		{
			icon: "info",
			title: "Folder ID",
		},
		{
			icon: "folder",
			title: "Folder Path",
		},
		{
			icon: "globe-2",
			title: "Global State",
		},
		{
			icon: "home",
			title: "Local State",
		},
		{
			icon: "refresh-cw",
			title: "Rescans",
		},
		{
			icon: "file",
			title: "File Versioning",
		},
		{
			icon: "share-2",
			title: "Shared With",
		},
		{
			icon: "clock-9",
			title: "Last Scan",
		},
		{
			icon: "arrow-left-right",
			title: "Latest Change",
		},
	];
</script>

<ConfigurationItem {data}>
	<svelte:fragment slot="title">
		<ObsidianLucideIcon name="folder" />
		<span>{folder.label}</span>
		<span style="flex: 1 0 auto; text-align: end;">Unshared</span>
	</svelte:fragment>

	<svelte:fragment let:item>
		{#if item.icon === data[0].icon}
			<span>Date of last seen.</span>
		{:else if item.icon === data[1].icon}
			<span>up to date</span>
		{:else if item.icon === data[2].icon}
			<span> Files: 100, Folders: 50, Storage: ~40 MiB </span>
		{:else if item.icon === data[3].icon}
			<span> Files: 100, Folders: 50, Storage: ~40 MiB </span>
		{:else if item.icon === data[4].icon}
			<span>{folder.label}</span>
		{:else if item.icon === data[5].icon}
			<span>Lastest version !!</span>
		{:else if item.icon === data[6].icon}
			<span>
				{folder.devices
					.map((device) => device.deviceID.slice(0, 7))
					.join(", ")}
			</span>
		{:else if item.icon === data[7].icon}
			<span>Latest scan !!!</span>
		{:else if item.icon === data[8].icon}
			<span>Ultimate change !</span>
		{:else}
			<span>Not implemented yet!</span>
		{/if}
	</svelte:fragment>

	<div slot="footer" class="footer">
		<button
			on:click={async (event) => {
				new Notice("Not implemented yet!");
			}}
		>
			<ObsidianLucideIcon name="pause" />
			<span>Pause</span>
		</button>
		<button
			on:click={async (event) => {
				new Notice("Not implemented yet!");
			}}
		>
			<ObsidianLucideIcon name="history" />
			<span>Versions</span>
		</button>
		<button
			on:click={async (event) => {
				new Notice("Not implemented yet!");
			}}
		>
			<ObsidianLucideIcon name="refresh-cw" />
			<span>Rescan</span>
		</button>
		<button
			on:click={async (event) => {
				new Notice("Not implemented yet!");
			}}
		>
			<ObsidianLucideIcon name="pencil" />
			<span>Edit</span>
		</button>
	</div>
</ConfigurationItem>

<style>
	.footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin: 1em 0 0 0;
	}
	.footer button {
		gap: 0.5rem;
	}
</style>
