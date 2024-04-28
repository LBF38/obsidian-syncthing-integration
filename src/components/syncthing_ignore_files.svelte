<script lang="ts">
	import { Notice, normalizePath } from "obsidian";
	import { SyncthingSettingTab } from "src/views/settings_tab";
	import { writable } from "svelte/store";
	import ObsidianSettingsItem from "./obsidian_settings_item.svelte";
	import FileSuggester from "./suggesters/file_suggester.svelte";

	export let parent: SyncthingSettingTab;
	const syncthingIgnoreFilePath = normalizePath(".stignore");

	async function getIgnoredFiles() {
		let ignoredFilesContent = "";
		try {
			ignoredFilesContent = await parent.app.vault.adapter.read(
				syncthingIgnoreFilePath,
			);
		} catch (error) {
			console.error("Error: ", error);
			new Notice("No .stignore file found.");
		}
		return ignoredFilesContent
			.replace(/\r|\n+$/g, "")
			.replace(/\n+/g, "\n")
			.split("\n");
	}

	async function updateIgnoredFiles(content: string) {
		const oldContent = await getIgnoredFiles();
		// check if the content is already in the file
		if (oldContent.includes(content)) {
			new Notice("This pattern is already in the .stignore file.");
			return;
		}
		await parent.app.vault.adapter.write(
			syncthingIgnoreFilePath,
			`${content}\n${oldContent.join("\n")}`,
		);
		ignoredFiles.set(await getIgnoredFiles());
	}

	async function deleteIgnoredFiles(content: string) {
		const oldContent = await getIgnoredFiles();
		await parent.app.vault.adapter.write(
			syncthingIgnoreFilePath,
			oldContent.filter((item) => item !== content).join("\n"),
		);
		ignoredFiles.set(await getIgnoredFiles());
	}

	const ignoredFiles = writable<string[]>([]);
	ignoredFiles.subscribe(async (value) => {
		value = await getIgnoredFiles();
	});
	(async () => {
		ignoredFiles.set(await getIgnoredFiles());
	})();
	console.log("ignoredFiles: ", $ignoredFiles);
</script>

<ObsidianSettingsItem name="Syncthing Ignored Files" heading={true} />
<ObsidianSettingsItem name="Set the ignored files">
	<svelte:fragment slot="description">
		<p>
			Please set the files you want to ignore in your vault when syncing
			with Syncthing. See <a
				href="https://docs.syncthing.net/users/ignoring.html"
				target="_blank">Syncthing documentation</a
			> for more information.
		</p>
	</svelte:fragment>
	<svelte:fragment slot="control">
		<div class="input-container">
			<FileSuggester
				{parent}
				onChange={async (value) => {
					console.log("value: ", value);
					await updateIgnoredFiles(value);
				}}
			/>
			<input
				type="text"
				placeholder="Enter some text..."
				on:change={async (event) => {
					const value = event.currentTarget.value;
					console.log("value: ", value);
					await updateIgnoredFiles(value);
				}}
			/>
		</div>
	</svelte:fragment>
</ObsidianSettingsItem>

{#if $ignoredFiles.length > 0}
	{#each $ignoredFiles.filter((item) => item !== "") as item}
		<ObsidianSettingsItem name={item}>
			<svelte:fragment slot="control">
				<button on:click={async () => deleteIgnoredFiles(item)}>
					Remove
				</button>
			</svelte:fragment>
		</ObsidianSettingsItem>
	{/each}
{/if}

<style>
	.input-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
