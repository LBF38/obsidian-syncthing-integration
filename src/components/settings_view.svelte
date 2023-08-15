<script lang="ts">
	import { Notice, Platform } from "obsidian";
	import { ObsidianLogo, SyncthingLogo } from "src/views/logos";
	import { SyncthingSettingTab } from "src/views/settings_tab";
	import { onMount } from "svelte";
	import ObsidianSettingsItem from "./obsidian_settings_item.svelte";
	export let parent: SyncthingSettingTab;
	let hasSyncthing: boolean = false;

	onMount(async () => {
		// hasSyncthing = await parent.syncthingController.hasSyncThing();
	});
</script>

<!-- Banner -->
<p class="banner">
	<a href="https://github.com/LBF38/obsidian-syncthing-integration">
		<img src={SyncthingLogo} alt="Syncthing's logo" />
		<img src={ObsidianLogo} alt="Obsidian's logo" />
	</a>
</p>

<!-- Description / Purpose -->
<ObsidianSettingsItem name="Syncthing Integration for Obsidian" heading={true}>
	<p slot="description">
		This plugin allows you to sync your vault with Syncthing. It allows you
		to manage the sync process from within Obsidian. You can only manage the
		folder you are in. To use this plugin, you need to have Syncthing
		installed on your device. You can find more information about Syncthing
		here:
		<a href="https://syncthing.net">https://syncthing.net </a>
	</p>
</ObsidianSettingsItem>

<!-- Syncthing ERROR NOT FOUND -->
{#if !hasSyncthing}
	<ObsidianSettingsItem
		heading={true}
		error={true}
		name="Syncthing is not found"
		class="warning"
	>
		<div slot="description">
			Syncthing is not installed or not found on your device. Please
			install it at the following URL:
			<a href="https://syncthing.net/downloads" target="_blank">
				https://syncthing.net/downloads
			</a>
		</div>
	</ObsidianSettingsItem>
	<ObsidianSettingsItem
		name="Retry"
		description="If you want to retry connecting, after setting the API key. This might resolve the issue."
	>
		<div slot="control">
			<button class="mod-cta">Connect to Syncthing via API.</button>
		</div>
	</ObsidianSettingsItem>
{/if}

<!-- API Key setting -->
<ObsidianSettingsItem name="Syncthing API Key" heading={true}>
	<p slot="description">
		Add your Syncthing API key here for the plugin to work.
	</p>
	<div slot="control">
		{#await parent.syncthingController.getAPIKey()}
			<p>Waiting for API key...</p>
		{:then key}
			<input
				type="text"
				name="apikey"
				id="apikey"
				value={key}
				placeholder="Enter your API key here..."
				on:change={async (event) => {
					parent.plugin.settings.api_key = event.currentTarget.value;
					await parent.plugin.saveSettings();
				}}
			/>
		{:catch error}
			<p class="warning">Something went wrong: {error.message}</p>
		{/await}
	</div>
</ObsidianSettingsItem>

<ObsidianSettingsItem name="Syncthing API Status">
	<div slot="control">
		<button
			on:click={async () => {
				parent.syncthingController
					.getAPIStatus()
					.then((status) => {
						new Notice(`Syncthing Ping : ${status}`);
					})
					.catch((error) => {
						new Notice(error);
					});
			}}
		>
			Check API Status
		</button>
	</div>
</ObsidianSettingsItem>

{#if Platform.isDesktopApp}
	<ObsidianSettingsItem name="Syncthing CLI Status">
		<div slot="control">
			<button
				on:click={async () => {
					parent.syncthingController
						.getCLIStatus()
						.then((status) => {
							new Notice(`Syncthing Ping : ${status}`);
						})
						.catch((error) => {
							new Notice(error);
						});
				}}
			>
				Check CLI Status
			</button>
		</div>
	</ObsidianSettingsItem>
{/if}
<ObsidianSettingsItem
	name="In construction"
	description="This part is in construction."
/>

{#if Platform.isMobileApp}
	<ObsidianSettingsItem
		name="Warning"
		description="The following settings are in beta. All plugin's features may not currently be available on mobile."
		error={true}
	/>
	<ObsidianSettingsItem
		name="Open Syncthing mobile app"
		description="Open the Syncthing mobile app, if not it opens the Google Play Store page."
	>
		<div slot="control">
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
					Open Syncthing on Mobile.
				</a>
			</button>
		</div>
	</ObsidianSettingsItem>
{/if}

<!-- GUI Setting -->
<ObsidianSettingsItem name="Syncthing GUI" heading={true} />
<ObsidianSettingsItem
	name="In construction"
	description="This part is in construction."
/>

<!-- Configuration display -->
<ObsidianSettingsItem name="Syncthing Configuration" heading={true} />
<ObsidianSettingsItem
	name="In construction"
	description="This part is in construction."
/>

<!-- Plugin developer mode -->
<ObsidianSettingsItem name="Plugin's Dev Mode" heading={true} />
<ObsidianSettingsItem
	name="In construction"
	description="This part is in construction."
/>

<!-- Footer -->
<ObsidianSettingsItem heading={true}>
	<div slot="control" class="footer">
		<button>Sponsor</button>
		<button>GitHub repo</button>
		<button>Report a bug</button>
	</div>
</ObsidianSettingsItem>

<style>
	.banner {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
	}
	.banner a {
		text-decoration-line: none;
	}
	.banner img {
		height: 2em;
	}
	.warning {
		color: var(--text-error);
	}
	.footer {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}
</style>
