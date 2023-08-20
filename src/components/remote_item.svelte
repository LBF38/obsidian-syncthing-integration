<script lang="ts">
	import { Notice } from "obsidian";
	import ConfigurationItem from "./configuration_item.svelte";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import { ConfigurationItemData } from "./types";
	import { SyncthingDevice } from "src/models/entities";
	export let device: SyncthingDevice = {
		address: ["dynamic"],
		deviceID: "device ID",
		introducedBy: "introduced by",
		name: "device name",
		ignoredFolders: [],
		paused: false,
	};
	let data: ConfigurationItemData = [
		{
			icon: "eye",
			title: "Last seen",
			information: device.deviceID.slice(0, 7),
		},
		{
			icon: "cloud",
			title: "Sync Status",
			information: device.deviceID.slice(0, 7),
		},
		{
			icon: "link",
			title: "Address",
			information: device.address.join(", "),
		},
		{
			icon: "qr-code",
			title: "Identification",
			information: device.deviceID.slice(0, 7),
		},
		{
			icon: "folder",
			title: "Folders",
			information: device.deviceID.slice(0, 7),
		},
	];
</script>

<ConfigurationItem {data}>
	<svelte:fragment slot="title">
		<div style="display: flex;gap: 0.5em">
			<ObsidianLucideIcon name="hard-drive" />
			<span>{device.name ?? device.deviceID}</span>
		</div>
		<div
			style="display: flex; gap:0.5em;flex: 1 0 auto; justify-content: end;"
		>
			<span>Disconnected</span>
			<ObsidianLucideIcon name="wifi-off" />
		</div>
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
