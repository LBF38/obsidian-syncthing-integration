<script lang="ts">
	import { ConfigurationModal } from "src/views/configuration_modal";
	import ConfigurationItem from "./configuration_item.svelte";

	// TODO: add configuration table component
	export let parent: ConfigurationModal;
	parent.titleEl.setText("Syncthing Configuration");
	parent.titleEl.style.textAlign = "center";

	let syncthingBaseUrl = `${parent.plugin.settings.configuration.url?.protocol}://${parent.plugin.settings.configuration.url?.ip_address}:${parent.plugin.settings.configuration.url?.port}/}`;
	console.log(syncthingBaseUrl);
</script>

<div class="left">
	<div class="folder">
		<h2>Folders (#)</h2>
		<ConfigurationItem title="Folder #1">
			<svelte:fragment slot="footer">
				<button class="mod-cta">Edit</button>
			</svelte:fragment>
		</ConfigurationItem>
		<ConfigurationItem title="Folder #2" />
		<div class="controls">
			<button>Pause All</button>
			<button>Recent Changes</button>
			<button>Add Remote Device</button>
		</div>
	</div>
</div>
<div class="right">
	<div class="mydevice">
		<h2>This Device</h2>
		<ConfigurationItem />
	</div>
	<div class="remote">
		<h2>Remote Devices (#)</h2>
		<ConfigurationItem title="Remote Device #1">
			<svelte:fragment slot="footer">
				<button class="mod-cta">Edit</button>
			</svelte:fragment>
		</ConfigurationItem>
		<ConfigurationItem title="Remote Device #2" />
		<div class="controls">
			<button>Pause All</button>
			<button>Recent Changes</button>
			<button>Add Remote Device</button>
		</div>
	</div>
</div>

<style>
	/* your styles go here */
	.left {
		float: left;
		width: 50%;
	}
	.right {
		float: right;
		width: 50%;
	}
	.folder,
	.mydevice,
	.remote {
		width: 100%;
	}
	.controls {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		margin: 1em 0;
	}
	.controls button {
		margin: 0 0.5em;
	}
</style>
