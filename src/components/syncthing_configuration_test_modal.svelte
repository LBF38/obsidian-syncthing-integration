<script lang="ts">
	// your script goes here
	import { SyncthingFromREST } from "src/data/syncthing_remote_datasource";
	import SyncthingPlugin from "src/main";
	export let plugin: SyncthingPlugin;
	const syncthingREST = new SyncthingFromREST(plugin);
	// for (const property in syncthingREST) {
	// 	if (Object.prototype.hasOwnProperty.call(syncthingREST, property)) {
	// 		console.log(`Property or method: ${property}`);
	// 		console.log(
	// 			`Value: ${syncthingREST[property as keyof SyncthingFromREST]}`,
	// 		);
	// 	}
	// }
	function getParamNames(func: Function) {
		const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
		const ARGUMENT_NAMES = /([^\s,]+)/g;
		let fnStr = func.toString().replace(STRIP_COMMENTS, "");
		let result = fnStr
			.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
			.match(ARGUMENT_NAMES);
		if (result === null) result = [];
		return result;
	}
	function logMethodParameters(value: any) {
		if (typeof value === "function") {
			console.log(`Method: ${value}`);
			console.log(`Parameters: ${getParamNames(value)}`);
		}
	}
	// for (const property in syncthingREST) {
	// 	if (typeof syncthingREST[property] === "function") {
	// 		console.log(`Method: ${property}`);
	// 		console.log(
	// 			`Parameters: ${getParamNames(syncthingREST[property])}`,
	// 		);
	// 	}
	// }
</script>

{#each Object.keys(syncthingREST) as value}
	<h1>
		{value}
	</h1>
	<div class="button-container">
		{#each Object.keys(syncthingREST[value]) as item}
			<button
				on:click={() => {
					console.log(syncthingREST[value][item]);
					logMethodParameters(syncthingREST[value][item]);
					syncthingREST[value][item]();
				}}
			>
				{item}
			</button>
		{/each}
	</div>
{/each}

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
