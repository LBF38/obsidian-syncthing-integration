<!-- This file is for providing a reusable component to display information about a sync conflict file. -->
<script lang="ts">
	import { TFile } from "obsidian";
	import { SyncthingController } from "src/controllers/main_controller";
	import { Failure } from "src/models/failures";
	import Error from "./error.svelte";
	import { formatBytes } from "src/controllers/utils";

	export let counter: number;
	export let file: TFile;
	export let syncthingController: SyncthingController;
	const filenameProps = syncthingController.parseConflictFilename(file.name);
</script>

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
				Last modified at: {new Date(file.stat.mtime).toLocaleString()}
			</li>
			<li>Created at: {new Date(file.stat.ctime).toLocaleString()}</li>
			<li>Path: {file.path}</li>
		</ul>
	</div>
{/if}

<style>
	/* TODO */
</style>
