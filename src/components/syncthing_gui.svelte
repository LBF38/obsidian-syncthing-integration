<script lang="ts">
	import { Platform } from "obsidian";
	import SyncthingPlugin from "src/main";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import WarningMessage from "./warning_message.svelte";

	export let plugin: SyncthingPlugin;
	/**
	 * The height of the embedded frame.
	 * Ignored on mobile, where the GUI cannot be embedded.
	 */
	export let height = "600px";

	function buildGUIUrl(): string {
		const { url, gui_username, gui_password } = plugin.settings;
		const protocol = url?.protocol ?? "http";
		const ipAddress = url?.ip_address ?? "localhost";
		const port = url?.port ?? 8384;
		if (gui_username && gui_password) {
			return `${protocol}://${encodeURIComponent(gui_username)}:${encodeURIComponent(gui_password)}@${ipAddress}:${port}`;
		}
		return `${protocol}://${ipAddress}:${port}`;
	}

	$: guiUrl = buildGUIUrl();

	function openInBrowser() {
		// eslint-disable-next-line no-undef
		open(guiUrl);
	}
</script>

<div class="syncthing-gui">
	<div class="syncthing-gui-header">
		<span>Syncthing Web GUI</span>
		<button on:click={openInBrowser}>
			<ObsidianLucideIcon name="external-link" />
			<span>Open in browser</span>
		</button>
	</div>

	{#if Platform.isMobileApp}
		<WarningMessage
			title="Not available on mobile"
			message="Embedding the Syncthing Web GUI is only available on the desktop app. Please open it in your browser instead."
		>
			<button on:click={openInBrowser}> Open in browser </button>
		</WarningMessage>
	{:else}
		<WarningMessage
			message="If the GUI does not load here, enable 'Allow Frame Loading' in Syncthing's GUI settings (Actions > Settings > GUI) and make sure the address above points to your Syncthing instance. You can always open it in your browser instead."
		/>
		<iframe
			class="syncthing-gui-frame"
			src={guiUrl}
			title="Syncthing Web GUI"
			style={`height: ${height};`}
		></iframe>
	{/if}
</div>

<style>
	.syncthing-gui {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
	.syncthing-gui-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		font-weight: var(--font-semibold);
		margin-bottom: 0.5em;
	}
	.syncthing-gui-header button {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
	}
	.syncthing-gui-frame {
		width: 100%;
		flex: 1 1 auto;
		border: 1px solid var(--background-modifier-border);
		border-radius: var(--radius-m);
		background-color: var(--background-primary);
	}
</style>
