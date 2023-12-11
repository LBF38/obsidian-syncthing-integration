<script lang="ts">
	// your script goes here
	import { SyncthingFromREST } from "src/data/syncthing_remote_datasource";
	import SyncthingPlugin from "src/main";
	export let plugin: SyncthingPlugin;
	const syncthingREST = new SyncthingFromREST(plugin);
	const systemMethods = [
		syncthingREST.system.ping,
		syncthingREST.system.version,
		syncthingREST.system.status,
		syncthingREST.system.connections,
		syncthingREST.system.browse,
		syncthingREST.system.shutdown,
		syncthingREST.system.restart,
		syncthingREST.system.reset,
	];
	const all = new Map<string, Array<CallableFunction>>();
	all.set("system", systemMethods);
</script>

{#each all.entries() as entry}
	<h1>
		{entry[0]}
	</h1>
	<div class="button-container">
		{#each entry[1] as item}
			<button
				on:click={async () => {
					console.log(item);
					const result = await item();
					console.log(result);
				}}
			>
				{Object(item).name}
			</button>
		{/each}
	</div>
{/each}
<h1>Other - test</h1>
<button on:click={async () => console.log(await syncthingREST.system.ping())}>
	test
</button>

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
