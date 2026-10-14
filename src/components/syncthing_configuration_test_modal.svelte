<script lang="ts">
	import { SyncthingFromREST } from "src/data/syncthing_remote_datasource";
	import SyncthingPlugin from "src/main";
	import LightBulb from "./light_bulb.svelte";
	import { useActor } from "@xstate/svelte";
	import { getNextEvents, syncthingConfigurationMachine } from "./machines";
	export let plugin: SyncthingPlugin;
	const syncthingREST = new SyncthingFromREST(plugin);
	const { snapshot, send } = useActor(syncthingConfigurationMachine, {
		input: {
			syncthingREST,
		},
	});
	snapshot.subscribe((state) => {
		console.log(state);
	});
</script>

<LightBulb />
<h1>Testing SyncthingConfiguration Machine</h1>
<code>{JSON.stringify($snapshot.context.configuration)}</code>
<br />
<div class="button-container">
	{#each getNextEvents($snapshot) as event}
		<button on:click={() => send({ type: event })}>{event}</button>
	{/each}
</div>

<style>
	.button-container {
		display: grid;
		grid-template-columns: repeat(
			auto-fill,
			minmax(100px, 1fr)
		); /* adjust 100px to your preferred minimum button width */
		gap: 10px; /* adjust for your preferred gap between buttons */
	}
</style>
