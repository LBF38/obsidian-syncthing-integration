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
		},
		{
			icon: "cloud",
			title: "Sync Status",
		},
		{
			icon: "link",
			title: "Address",
		},
		{
			icon: "qr-code",
			title: "Identification",
		},
		{
			icon: "folder",
			title: "Folders",
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

	<svelte:fragment let:item>
		{#if item.icon === data[0].icon}
			<span>Date of last seen.</span>
		{:else if item.icon === data[1].icon}
			<span>up to date</span>
		{:else if item.icon === data[2].icon}
			<span>{device.address.join(", ")}</span>
		{:else if item.icon === data[3].icon}
			<a
				href="/"
				on:click={() => {
					new Notice("Not implemented yet!");
				}}
			>
				{device.deviceID.slice(0, 7)}
			</a>
		{:else if item.icon === data[4].icon}
			<span>{device.name}</span>
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
