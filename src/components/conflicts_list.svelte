<script lang="ts">
	import { Setting, TFile } from "obsidian";
	import { ConflictsModal } from "src/views/conflicts_modal";
	import { onMount } from "svelte";
	import ConflictItem from "./conflict_item.svelte";

	// TODO
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
					conflicts = parentModal.sortFilesBy(
						conflicts,
						value as keyof typeof sortOptions
					);
					console.log("dropdown", conflicts);
				});
			});
	});

	parentModal.titleEl.setText("Syncthing Conflicts");
	$: if (conflicts) console.log("conflicts", conflicts);
</script>

<div bind:this={sortSettingContainer} />
{#each conflicts.keys() as conflictNames, i}
	{#if i !== 0}
		<div class="divider" />
	{/if}
	<ConflictItem
		conflicts={conflicts.get(conflictNames) ?? []}
		syncthingController={parentModal.syncthingController}
		{parentModal}
	/>
{/each}

<style>
	.divider {
		margin-top: 10px;
		margin-bottom: 10px;
		border-bottom: 2px solid var(--background-modifier-border);
	}
</style>
