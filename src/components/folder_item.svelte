<script lang="ts">
	import { Notice } from "obsidian";
	import { SyncthingFolder } from "src/models/entities";
	import ConfigurationItem from "./configuration_item.svelte";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import { Output } from "valibot";
	export let folder: Output<typeof SyncthingFolder> = {
		id: "folder ID",
		label: "folder label",
		path: "folder path",
		type: "sendreceive",
		devices: [
			{ deviceID: "device 1", introducedBy: "" },
			{ deviceID: "device 2", introducedBy: "" },
		],
		filesystemType: "filesystem type",
		maxConflicts: 0,
	};
</script>

<!-- TODO: refactor this inside of the ConfigurationItem component to use Svelte stores. -->
<ConfigurationItem {folder} device={undefined}>
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
