<script lang="ts">
	import { Notice, Platform } from "obsidian";
	import { Failure } from "src/models/failures";
	import { ObsidianLogo, SyncthingLogo } from "src/views/logos";
	import { SyncthingSettingTab } from "src/views/settings_tab";
	import { onMount } from "svelte";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import ObsidianSettingsItem from "./obsidian_settings_item.svelte";
	import ObsidianToggle from "./obsidian_toggle.svelte";
	import { ConfigurationModal } from "src/views/configuration_modal";
	export let parent: SyncthingSettingTab;
	let hasSyncthing = true;
	let apiInputType = "password";
	let guiPasswordInputType = "password";
	let syncthingBaseUrl = "";

	onMount(async () => {
		hasSyncthing = await parent.syncthingController.hasSyncthing();
	});

	async function getAPIkey() {
		parent.syncthingController.getAPIKey().then((key) => {
			if (key instanceof Failure) {
				new Notice(key.message);
				return;
			}
			parent.plugin.settings.api_key = key;
			parent.plugin.saveSettings();
		});
	}
	$: syncthingBaseUrl = `${parent.plugin.settings.configuration.url?.protocol}://${parent.plugin.settings.configuration.url?.ip_address}:${parent.plugin.settings.configuration.url?.port}`;
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
	>
		<svelte:fragment slot="description">
			Syncthing is not installed or not found on your device. Please
			install it at the following URL:
			<a href="https://syncthing.net/downloads" target="_blank">
				https://syncthing.net/downloads
			</a>
		</svelte:fragment>
	</ObsidianSettingsItem>
	<ObsidianSettingsItem
		name="Retry"
		description="If you want to retry connecting, after setting the API key. This might resolve the issue."
	>
		<svelte:fragment slot="control">
			<button class="mod-cta">Connect to Syncthing via API.</button>
		</svelte:fragment>
	</ObsidianSettingsItem>
{/if}

<!-- API Key setting -->
<ObsidianSettingsItem name="Syncthing API Key" heading={true}>
	<svelte:fragment slot="description">
		Add your Syncthing API key here for the plugin to work.
	</svelte:fragment>
	<svelte:fragment slot="control">
		<input
			type={apiInputType}
			name="apikey"
			id="apikey"
			value={parent.plugin.settings.api_key}
			placeholder="Enter your API key here..."
			on:change={async (event) => {
				parent.plugin.settings.api_key = event.currentTarget.value;
				await parent.plugin.saveSettings();
			}}
		/>
		{#if !parent.plugin.settings.api_key}
			<button on:click={getAPIkey}> Get API key </button>
		{:else}
			<button
				on:click={() => {
					apiInputType =
						apiInputType === "password" ? "text" : "password";
				}}
			>
				{#if apiInputType === "password"}
					<ObsidianLucideIcon name="eye" />
				{:else}
					<ObsidianLucideIcon name="eye-off" />
				{/if}
			</button>
			<button
				on:click={async () => {
					parent.plugin.settings.api_key = "";
					await parent.plugin.saveSettings();
				}}
			>
				<ObsidianLucideIcon name="eraser" />
			</button>
		{/if}
	</svelte:fragment>
</ObsidianSettingsItem>

<!-- Syncthing status -->
<ObsidianSettingsItem name="Syncthing API Status">
	<svelte:fragment slot="control">
		<button
			on:click={async () => {
				parent.syncthingController
					.getAPIStatus()
					.then((status) => {
						new Notice(`Syncthing Ping : ${status}`);
					})
					.catch((error) => {
						console.log("settings tab error: ", error);
						new Notice(error.message);
					});
			}}
		>
			Check API Status
		</button>
	</svelte:fragment>
</ObsidianSettingsItem>

{#if Platform.isDesktopApp}
	<ObsidianSettingsItem name="Syncthing CLI Status">
		<svelte:fragment slot="control">
			<button
				on:click={async () => {
					parent.syncthingController
						.getCLIStatus()
						.then((status) => {
							new Notice(`Syncthing Ping : ${status}`);
						})
						.catch((error) => {
							new Notice(error.message);
						});
				}}
			>
				Check CLI Status
			</button>
		</svelte:fragment>
	</ObsidianSettingsItem>
{/if}

<!-- Mobile settings -->
{#if Platform.isMobileApp}
	<ObsidianSettingsItem
		name="Warning"
		description="The following settings are in beta. All plugin's features may not currently be available on mobile."
		error={true}
	/>
{/if}

<!-- GUI Setting -->
<ObsidianSettingsItem name="Syncthing base URL" heading={true} />
<ObsidianSettingsItem
	name="Set the Syncthing base URL"
	description="Please set your Syncthing base URL here. This address will be used to open the Syncthing GUI in your browser and to make API requests."
>
	<div
		slot="control"
		style="display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end;"
	>
		<div style="display: flex; align-items: center;">
			<select
				style="border-radius: var(--input-radius) 0 0 var(--input-radius);"
				value={parent.plugin.settings.configuration.url?.protocol ?? ""}
				on:change={async (event) => {
					console.log(
						"select change: ",
						event,
						event.currentTarget.value
					);
					if (!parent.plugin.settings.configuration.url) {
						parent.plugin.settings.configuration.url = {
							protocol: "http",
							ip_address: "localhost",
							port: 8384,
						};
					}
					if (
						event.currentTarget.value === "http" ||
						event.currentTarget.value === "https"
					)
						parent.plugin.settings.configuration.url.protocol =
							event.currentTarget.value;
					await parent.plugin.saveSettings();
				}}
			>
				<option value="http"> http://</option>
				<option value="https"> https://</option>
			</select>

			<input
				type="text"
				placeholder="Enter your Syncthing address here..."
				value={parent.plugin.settings.configuration.url?.ip_address ??
					""}
				on:change={async (event) => {
					console.log(
						"ip address change: ",
						event,
						event.currentTarget.value
					);
					const valueChange = event.currentTarget.value;
					if (!parent.plugin.settings.configuration.url) {
						parent.plugin.settings.configuration.url = {
							protocol: "http",
							ip_address: "localhost",
							port: 8384,
						};
					}
					parent.plugin.settings.configuration.url.ip_address =
						valueChange === "" || !valueChange
							? "localhost"
							: valueChange;
					await parent.plugin.saveSettings();
				}}
				style="border-radius: 0;"
			/>
			<input
				type="number"
				placeholder="Enter the port..."
				value={parent.plugin.settings.configuration.url?.port ?? ""}
				on:change={async (event) => {
					console.log(
						"port change: ",
						event,
						event.currentTarget.value
					);
					const valueChange = event.currentTarget.value;
					if (!parent.plugin.settings.configuration.url) {
						parent.plugin.settings.configuration.url = {
							protocol: "http",
							ip_address: "localhost",
							port: 8384,
						};
					}
					parent.plugin.settings.configuration.url.port =
						isNaN(parseInt(valueChange)) || !valueChange
							? 8384
							: parseInt(valueChange);
					await parent.plugin.saveSettings();
				}}
				style="border-radius: 0 var(--input-radius) var(--input-radius) 0;"
			/>
		</div>
		<input style="margin: 2% 0;" value={syncthingBaseUrl} disabled />
	</div>
</ObsidianSettingsItem>
<ObsidianSettingsItem
	name="Set GUI Credentials"
	description="Please set your Syncthing GUI credentials here. These credentials will be used to open the Syncthing GUI in your browser."
>
	<svelte:fragment slot="control">
		<input
			type="text"
			placeholder="Enter your GUI username..."
			id="gui-username"
			bind:value={parent.plugin.settings.gui_username}
			on:change={async (event) => {
				parent.plugin.settings.gui_username = event.currentTarget.value;
				await parent.plugin.saveSettings();
			}}
			required={Platform.isMobileApp}
		/>
		<input
			type={guiPasswordInputType}
			placeholder="Enter your GUI password..."
			id="gui-password"
			value={parent.plugin.settings.gui_password ?? ""}
			on:change={async (event) => {
				parent.plugin.settings.gui_password = event.currentTarget.value;
				await parent.plugin.saveSettings();
			}}
			required={Platform.isMobileApp}
		/>
		<button
			on:click={() => {
				guiPasswordInputType =
					guiPasswordInputType === "password" ? "text" : "password";
			}}
		>
			{#if guiPasswordInputType === "password"}
				<ObsidianLucideIcon name="eye" />
			{:else}
				<ObsidianLucideIcon name="eye-off" />
			{/if}
		</button>
	</svelte:fragment>
</ObsidianSettingsItem>
<ObsidianSettingsItem
	name="Open Syncthing GUI"
	description="Open the Syncthing GUI in your browser."
>
	<button
		slot="control"
		class="mod-cta"
		on:click={async () => {
			if (
				(!parent.plugin.settings.gui_username ||
					!parent.plugin.settings.gui_password) &&
				Platform.isMobileApp
			) {
				new Notice(
					"Please set your GUI credentials first. There are needed on mobile app."
				);
				return;
			}
			let url;
			if (
				parent.plugin.settings.gui_username &&
				parent.plugin.settings.gui_password
			) {
				url = `https://${parent.plugin.settings.gui_username}:${parent.plugin.settings.gui_password}@${syncthingBaseUrl}`;
			} else {
				url = `https://${syncthingBaseUrl}`;
			}
			// eslint-disable-next-line no-undef
			open(url);
		}}
	>
		<ObsidianLucideIcon name="link" />
	</button>
</ObsidianSettingsItem>

<!-- Configuration display -->
<ObsidianSettingsItem name="Syncthing Configuration" heading={true} />
<ObsidianSettingsItem
	name="In construction"
	description="This part is in construction."
>
	<button
		on:click={async (event) => {
			new Notice("This part is in construction.");
			new ConfigurationModal(parent.app, parent.plugin).open();
		}}
		slot="control"
	>
		<ObsidianLucideIcon name="cog" />
	</button>
</ObsidianSettingsItem>

<!-- Plugin developer mode -->
{#if Platform.isDesktopApp}
	<ObsidianSettingsItem name="Plugin's Dev Mode" heading={true} />
	<ObsidianSettingsItem
		name="Enable Plugin's Developer Mode"
		description="For the moment, the developer mode contains a Syncthing conflicts generator. It allows to test the plugin's conflict resolution system."
	>
		<svelte:fragment slot="description">
			For the moment, the developer mode contains a Syncthing conflicts
			generator.
			<br />
			It allows to test the plugin's conflict resolution system.
		</svelte:fragment>
		<ObsidianToggle
			callback={async (value) => {
				parent.plugin.settings.devMode = value;
				await parent.plugin.saveSettings();
				// TODO: Refactor using the unload command workaround.
				parent.plugin.onunload();
				parent.plugin.onload();
			}}
			slot="control"
		/>
	</ObsidianSettingsItem>
{/if}

<!-- Open Mobile app -->
{#if Platform.isMobileApp}
	<ObsidianSettingsItem name="Open Mobile app" heading={true} />
	<ObsidianSettingsItem
		name="Open Syncthing mobile app"
		description="Open the Syncthing mobile app, if not it opens the Google Play Store page."
	>
		<svelte:fragment slot="control">
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
				Open Syncthing on Mobile.
			</button>
		</svelte:fragment>
	</ObsidianSettingsItem>
{/if}

<!-- Footer -->
<ObsidianSettingsItem heading={true}>
	<div slot="control" class="footer">
		<button
			on:click={() => {
				// eslint-disable-next-line no-undef
				open("https://github.com/sponsors/LBF38");
			}}
		>
			<ObsidianLucideIcon name="heart" />
			Sponsor
		</button>
		<button
			on:click={() => {
				// eslint-disable-next-line no-undef
				open("https://github.com/LBF38/obsidian-syncthing-integration");
			}}
		>
			<ObsidianLucideIcon name="github" />
			GitHub repo
		</button>
		<button
			on:click={() => {
				// eslint-disable-next-line no-undef
				open(
					"https://github.com/LBF38/obsidian-syncthing-integration/issues/new/choose"
				);
			}}
		>
			<ObsidianLucideIcon name="bug" />
			Report a bug
		</button>
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
	.footer {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}
	.footer button {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 0.5em;
		justify-content: space-around;
	}
</style>
