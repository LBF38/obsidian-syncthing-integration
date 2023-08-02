<!-- This file is for providing a reusable component to display information about a sync conflict file. -->
<script lang="ts">
	import { TFile } from "obsidian";
	import { SyncthingController } from "src/controllers/main_controller";
	import { formatBytes } from "src/controllers/utils";
	import { Failure } from "src/models/failures";
	import { createEventDispatcher } from "svelte";
	import Error from "./error.svelte";

	export let counter: number;
	export let file: TFile;
	export let syncthingController: SyncthingController;
	export let styled = false;
	export let isClicked = false;
	let dispatch = createEventDispatcher<{
		file: { file: TFile };
	}>();
	const filenameProps = syncthingController.parseConflictFilename(file.name);
	function handleClick() {
		dispatch("file", { file: file });
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={() => {
		if (styled) handleClick();
	}}
	class:conflict-file={styled}
	class:selected={isClicked}
>
	{#if filenameProps instanceof Failure}
		<Error failure={filenameProps} />
	{:else}
		<div>
			<strong>Conflict #{counter}</strong>
			<em>
				Occured on: {filenameProps.dateTime.toLocaleString()}
			</em>
			<ul>
				<li>
					Conflict date: {filenameProps.dateTime.toLocaleString()}
				</li>
				<li>
					Modified by: {filenameProps.modifiedBy}
				</li>
				<li>
					Extension: <code>{file.extension}</code>
				</li>
				<li>Size: {formatBytes(file.stat.size, 1)}</li>
				<li>
					Last modified at: {new Date(
						file.stat.mtime
					).toLocaleString()}
				</li>
				<li>
					Created at: {new Date(file.stat.ctime).toLocaleString()}
				</li>
				<li>Path: {file.path}</li>
			</ul>
		</div>
	{/if}
</div>

<style>
	.conflict-file {
		padding: 0.5em;
		border-radius: 0.5em;
		margin: 0.5em;
		/* background-color: var(--background-secondary); */
	}
	.conflict-file:hover {
		background-color: var(--background-secondary-alt);
	}
	.conflict-file:active {
		background-color: var(--background-secondary-alt);
	}
	.selected {
		background-color: var(--background-secondary-alt);
	}
</style>
