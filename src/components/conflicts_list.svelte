<script lang="ts">
	import { Setting, TFile } from "obsidian";
	import { ConflictsModal } from "src/views/conflicts_modal";
	import { onMount } from "svelte";
	import ConflictItem from "./conflict_item.svelte";
	import { sortFilesBy } from "src/controllers/utils";

	export let parentModal: ConflictsModal;
	export let conflicts: Map<string, TFile[]>;
	let sortSettingContainer: HTMLDivElement;
	let sortOptions = {
		recent: "Most recent",
		old: "Least recent",
		"a-to-z": "A to Z",
		"z-to-a": "Z to A",
	};

	onMount(() => {
		new Setting(sortSettingContainer)
			.setName("Sort by date")
			.addDropdown((dropdown) => {
				dropdown.addOptions(sortOptions);
				dropdown.onChange((value) => {
					conflicts = sortFilesBy(
						conflicts,
						value as keyof typeof sortOptions,
						parentModal.syncthingController,
					);
					console.log("dropdown", conflicts);
				});
			});
		conflicts = sortFilesBy(
			conflicts,
			"recent",
			parentModal.syncthingController,
		);
	});

	parentModal.titleEl.setText("Syncthing Conflicts");
	$: if (conflicts) console.log("conflicts", conflicts);
</script>

{#if conflicts.size === 0}
	<p>No conflicts found.</p>
{:else}
	<div bind:this={sortSettingContainer} />
	{#each conflicts.keys() as conflictNames, i (conflictNames)}
		{#if i !== 0}
			<div class="divider" />
		{/if}
		<ConflictItem
			conflicts={conflicts.get(conflictNames) ?? []}
			syncthingController={parentModal.syncthingController}
			{parentModal}
		/>
	{/each}
{/if}

<style>
	.divider {
		margin-top: 10px;
		margin-bottom: 10px;
		border-bottom: 2px solid var(--background-modifier-border);
	}
</style>
