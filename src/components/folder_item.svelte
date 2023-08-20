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
			information: folder.id,
		},
		{
			icon: "folder",
			title: "Folder Path",
			information: folder.path,
		},
		{
			icon: "globe-2",
			title: "Global State",
			information: `TO REFACTOR: ${folder.id}`,
		},
		{
			icon: "home",
			title: "Local State",
			information: `TO REFACTOR: ${folder.id}`,
		},
		{
			icon: "refresh-cw",
			title: "Rescans",
			information: `TO REFACTOR: ${folder.type}`,
		},
		{
			icon: "file",
			title: "File Versioning",
			information: `TO REFACTOR: ${folder.type}`,
		},
		{
			icon: "share-2",
			title: "Shared With",
			information: folder.devices
				.map((item) => item.deviceID.slice(0, 7))
				.join(", "),
		},
		{
			icon: "clock-9",
			title: "Last Scan",
			information: `TO REFACTOR: ${folder.type}`,
		},
		{
			icon: "arrow-left-right",
			title: "Latest Change",
			information: `TO REFACTOR: ${folder.type}`,
		},
	];
</script>

<ConfigurationItem {data}>
	<svelte:fragment slot="title">
		<ObsidianLucideIcon name="folder" />
		<span>{folder.label}</span>
		<span style="flex: 1 0 auto; text-align: end;">Unshared</span>
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
