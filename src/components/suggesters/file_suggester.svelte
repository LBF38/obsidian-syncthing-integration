<script lang="ts">
	import { SyncthingSettingTab } from "src/views/settings_tab";
	import { onMount } from "svelte";
	import { FileSuggester } from "./FileSuggester";
	import { Setting, debounce } from "obsidian";

	export let parent: SyncthingSettingTab;
	export let onChange: (value: string) => void;
	let className = "";
	export { className as class };

	let containerEl: HTMLElement;
	onMount(() => {
		new Setting(containerEl).addSearch((cb) => {
			new FileSuggester(parent.app, cb.inputEl);
			cb.setPlaceholder("Type to search for a file")
				.setValue("")
				.onChange(debounce(onChange, 750));
		});
	});
</script>

<div id="file-suggester" class={className} bind:this={containerEl} />

<style>
	/* your styles go here */
</style>
