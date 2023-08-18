<script lang="ts">
	import { TFile } from "obsidian";
	import { SyncthingController } from "src/controllers/main_controller";
	import { Failure } from "src/models/failures";
	import { ConflictsModal } from "src/views/conflicts_modal";
	import { DiffModal } from "src/views/diff_modal";
	import ConflictFileDetails from "./conflict_file_details.svelte";
	import { parseConflictFilename } from "src/controllers/utils";

	export let conflicts: TFile[];
	export let syncthingController: SyncthingController;
	export let parentModal: ConflictsModal;
	let filenameProps = parseConflictFilename(conflicts[0].name);
	if (filenameProps instanceof Failure) {
		console.error(filenameProps);
	}
</script>

<details>
	<summary>
		<p>
			<span>
				{#if filenameProps instanceof Failure}
					{filenameProps.message}
				{:else}
					{filenameProps.filename}
				{/if}
			</span>
			<span>
				({conflicts.length} conflict{conflicts.length > 1 ? "s" : ""})
			</span>
		</p>

		<button
			class="mod-cta"
			on:click={() =>
				new DiffModal(
					parentModal.app,
					conflicts[0],
					syncthingController
				).open()}
		>
			View conflict{conflicts.length > 1 ? "s" : ""}
		</button>
	</summary>
	{#each conflicts as conflict, i}
		{#if i !== 0}
			<div class="divider" />
		{/if}
		<ConflictFileDetails file={conflict} counter={i} />
	{/each}
</details>

<style>
	.divider {
		margin-top: 10px;
		margin-bottom: 10px;
		border-bottom: 2px solid var(--background-modifier-border);
	}
	details {
		padding: 1% 2%;
		border-radius: 10px;
	}
	details:hover {
		background-color: var(--background-modifier-hover);
	}
	summary {
		list-style: none;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	summary > p {
		display: flex;
		flex-direction: column;
	}
</style>
