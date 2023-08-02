<script lang="ts">
	import { TFile } from "obsidian";
	import { formatBytes } from "src/controllers/utils";

	export let file: TFile;
</script>

<div>
	<ul>
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

<style>
	/* TODO */
</style>
