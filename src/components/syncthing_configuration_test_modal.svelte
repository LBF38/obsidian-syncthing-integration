<script lang="ts">
	// your script goes here
	import { SyncthingFromREST } from "src/data/syncthing_remote_datasource";
	import SyncthingPlugin from "src/main";
	export let plugin: SyncthingPlugin;
	const syncthingREST = new SyncthingFromREST(plugin);

	const categories = [
		"system",
		"config",
		"cluster",
		"folder",
		"db",
		"event",
		"stats",
		"svc",
		"debug",
		"noauth",
	];
	let result = "";
</script>

{#each categories as category}
	<h2>{category}</h2>
	<div class="button-container">
		{#each Object.keys(syncthingREST[category]) as method}
			{#if typeof syncthingREST[category][method] === "function"}
				<button
					on:click={async () => {
						result = JSON.stringify(
							await syncthingREST[category][method](),
							null,
							2,
						);
					}}
				>
					{method}
				</button>
			{/if}
		{/each}
	</div>
{/each}

<pre>{result}</pre>

<!-- <h1>System</h1>
<div class="button-container">
	<button
		on:click={async () => {
			const result = await syncthingREST.system.ping();
			console.log(result);
		}}
	>
		Ping - GET
	</button>
	<button
		on:click={async () => {
			const result = await syncthingREST.system.ping("POST");
			console.log(result);
		}}
	>
		Ping - POST
	</button>
	<button
		on:click={async () => {
			const result = await syncthingREST.system.version();
			console.log(result);
		}}
	>
		version
	</button>
</div> -->

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
