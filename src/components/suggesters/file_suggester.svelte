<script lang="ts">
	import { SyncthingSettingTab } from "src/views/settings_tab";
	import { onMount } from "svelte";
	import { FileSuggester } from "./FileSuggester";
	import { Setting, debounce } from "obsidian";

	export let parent: SyncthingSettingTab;

	let containerEl: HTMLElement;
	onMount(() => {
		new Setting(containerEl)
			.setName("File Suggester")
			.setDesc("This is a file suggester")
			.addSearch((cb) => {
				new FileSuggester(parent.app, cb.inputEl);
				cb.setPlaceholder("Type to search for a file")
					.setValue("")
					.onChange(
						debounce(async (value) => {
							console.log(
								"some logic for value changes... ",
								value,
							);
							console.log(
								"file content of %s: %s",
								value,
								await parent.app.vault.adapter.read(value),
							);
						}, 750),
					);
			});
	});
</script>

<div id="file-suggester" bind:this={containerEl} />

<style>
	/* your styles go here */
</style>
