<!-- This file is for providing a reusable component to display information about a sync conflict file. -->
<script lang="ts">
	import { TFile } from "obsidian";
	import { SyncthingController } from "src/controllers/main_controller";
	import { Failure } from "src/models/failures";
	import Error from "./error.svelte";

	export let file: TFile;
	export let syncthingController: SyncthingController;
	const filenameProps = syncthingController.parseConflictFilename(file.name);
</script>

{#if filenameProps instanceof Failure}
	<Error failure={filenameProps} />
{:else}
	<div>
		<ul>
			<li>
				Conflict date: {filenameProps.dateTime.toLocaleString()}
			</li>
			<li>
				Modified by: {filenameProps.modifiedBy}
			</li>
		</ul>
	</div>
{/if}

<style>
	/* TODO */
</style>
