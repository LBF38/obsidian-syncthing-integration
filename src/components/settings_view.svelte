<script lang="ts">
	import { Component, Notice, Platform } from "obsidian";
	import { SyncthingController } from "src/controllers/main_controller";
	import { ObsidianLogo, SyncthingLogo } from "src/views/logos";
	import { SyncthingSettingTab } from "src/views/settings_tab";
	import { onMount } from "svelte";
	export let parent: SyncthingSettingTab;
	export let syncthingController: SyncthingController;
	let hasSyncthing: boolean;

	onMount(async () => {
		hasSyncthing = await syncthingController.hasSyncThing();
	});
</script>

<p class="banner">
	<a href="https://github.com/LBF38/obsidian-syncthing-integration">
		<img src={SyncthingLogo} alt="Syncthing's logo" />
		<img src={ObsidianLogo} alt="Obsidian's logo" />
	</a>
</p>
<div>
	Syncthing Integration for Obsidian
	<!-- TODO: ˆ make it prettier / setting header or bold -->
	<p>
		This plugin allows you to sync your vault with Syncthing. It allows you
		to manage the sync process from within Obsidian. You can only manage the
		folder you are in. To use this plugin, you need to have Syncthing
		installed on your device. You can find more information about Syncthing
		here:
		<a href="https://syncthing.net">https://syncthing.net</a>
	</p>
</div>

{#if !hasSyncthing}
	<h2 class="warning">Syncthing is not found on your device.</h2>
	<p class="warning">
		Syncthing is not installed or not found on your device. Please install
		it at the following URL:
		<a href="https://syncthing.net/downloads" target="_blank">
			https://syncthing.net/downloads
		</a>
	</p>
	<!-- TODO: add a return statement for leaving the component and not render what's next. (other solution: use of else) -->
{:else if Platform.isMobileApp}
	<button
		on:click={() => {
			if (!Platform.isAndroidApp) {
				new Notice(
					"The feature is not implemented for your platform. Please open the Syncthing app for your platform. You can create an issue on GitHub if you want to request this feature.",
					5000
				);
				return;
			}
			parent.plugin.syncthingFromAndroid.openSyncthing();
		}}
	>
		<a
			href="intent://syncthing.net/#Intent;scheme=https;package=com.nutomic.syncthingandroid;end"
			target="_blank"
		>
			Open Syncthing
		</a>
	</button>
	<h2>Warning</h2>
	<p>
		The following settings are in beta. All plugin's features may not
		currently be available on mobile.
	</p>
	<h2>Open Syncthing mobile app</h2>
	<p>
		Open the Syncthing mobile app, if not it opens the Google Play Store
		page.
	</p>
{:else if Platform.isDesktopApp}
	<p>Desktop layout.</p>
{/if}
<!-- Common layout -->
<p>Common layout in settings tab</p>

<style>
	.banner {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
	}
	.banner img {
		height: 2em;
		margin: 0 0.5em;
	}
	.warning {
		color: var(--text-error);
	}
</style>
