<script lang="ts">
	import { getIcon } from "obsidian";
	import { onMount } from "svelte";

	let element: HTMLDivElement;
	export let name: string;

	onMount(() => {
		let icon = getIcon(name);
		if (icon) element.appendChild(icon);
	});
</script>

<div bind:this={element} {...$$restProps} />
