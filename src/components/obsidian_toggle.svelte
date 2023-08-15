<script lang="ts">
	import { ToggleComponent } from "obsidian";
	import { onMount } from "svelte";

	export let callback: (value: boolean) => any;

	let element: HTMLDivElement;
	onMount(() => {
		new ToggleComponent(element).onChange(callback);
	});
</script>

<div bind:this={element} {...$$restProps}/>
