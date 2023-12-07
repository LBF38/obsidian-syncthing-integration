<script lang="ts">
	import { unifiedMergeView } from "@codemirror/merge";
	import { EditorState, Transaction } from "@codemirror/state";
	import { EditorView, basicSetup } from "codemirror";
	import { marked } from "marked";
	import { Notice, TFile } from "obsidian";
	import { DiffModal } from "src/views/diff_modal";
	import { MergeModal } from "src/views/merge_editor";
	import { onMount } from "svelte";
	import ConflictFileDetails from "./conflict_file_details.svelte";
	import FileDetails from "./file_details.svelte";

	export let parentModal: DiffModal;
	let unifiedMergeViewContainer: HTMLDivElement;
	let editor: EditorView;
	let currentConflict = parentModal.conflictingFiles[0];

	// Modal elements styling
	parentModal.titleEl.setText("Difference view");
	parentModal.titleEl.style.textAlign = "center";

	onMount(async () => {
		editor = new EditorView({
			parent: unifiedMergeViewContainer,
			state: EditorState.create({
				doc: await parentModal.app.vault.read(currentConflict),
				extensions: [
					basicSetup,
					EditorView.editable.of(false),
					EditorView.lineWrapping,
					EditorView.darkTheme.of(true),
					unifiedMergeView({
						original: await parentModal.app.vault.read(
							parentModal.originalFile
						),
						mergeControls: false,
						gutter: true,
						highlightChanges: true,
						syntaxHighlightDeletions: true,
					}),
				],
			}),
		});
	});

	async function acceptConflict() {
		const noticeTime = 2000;
		new Notice("Resolving conflict : Accepting left", noticeTime);
		const filenamePath = parentModal.originalFile.path;
		setTimeout(
			() => new Notice(`Deleting ${filenamePath}...`, noticeTime),
			500
		);
		await parentModal.app.vault.delete(parentModal.originalFile, true);
		new Notice("Original file deleted", 2000);
		setTimeout(() => {
			new Notice(
				`Renaming ${currentConflict.path} to ${filenamePath}...`,
				noticeTime
			);
		}, 1000);
		await parentModal.app.fileManager.renameFile(
			currentConflict,
			filenamePath
		);
		removeCurrentConflictFromList();
		new Notice(`Conflict resolved : Accepted left`, noticeTime);
		parentModal.originalFile = currentConflict;
		closeIfNoMoreConflicts();
		currentConflict = parentModal.conflictingFiles[0];
	}

	async function acceptOriginal() {
		new Notice("Resolving conflict : Accepting original", 5000);
		setTimeout(
			() => new Notice(`Deleting ${currentConflict.path}...`, 5000),
			1000
		);
		await parentModal.app.vault.delete(currentConflict);
		new Notice("Conflict resolved", 5000);
		removeCurrentConflictFromList(); // for reactivity
		closeIfNoMoreConflicts();
		currentConflict = parentModal.conflictingFiles[0];
	}

	function removeCurrentConflictFromList() {
		parentModal.conflictingFiles.remove(currentConflict);
		parentModal.conflictingFiles = parentModal.conflictingFiles;
	}

	function closeIfNoMoreConflicts() {
		if (parentModal.conflictingFiles.length === 0) {
			parentModal.close();
		}
	}

	function openMergeEditor() {
		new MergeModal(
			parentModal.app,
			parentModal.originalFile,
			currentConflict
		).open();
	}

	function updateEditorDoc(content: string): Transaction {
		return editor.state.update({
			changes: {
				from: 0,
				to: editor.state.doc.length,
				insert: content,
			},
		});
	}

	async function onFileChange(event: CustomEvent<{ file: TFile }>) {
		currentConflict = event.detail.file;
		editor.dispatch(
			updateEditorDoc(await parentModal.app.vault.read(currentConflict))
		);
	}
</script>

<div class="column">
	<h1>Conflicting files</h1>
	<div class="conflicts">
		{#each parentModal.conflictingFiles as file, i}
			{#if i !== 0}
				<div class="divider" />
			{/if}
			<ConflictFileDetails
				{file}
				counter={i}
				styled={true}
				isClicked={parentModal.conflictingFiles[i] === currentConflict}
				on:file={onFileChange}
			/>
		{/each}
	</div>
</div>
<div class="column">
	<h1>Quick difference view</h1>
	<div bind:this={unifiedMergeViewContainer} class="diff_view" />
</div>
<div class="column">
	<h1>Original file</h1>
	<h2>{parentModal.originalFile.basename}</h2>
	<FileDetails file={parentModal.originalFile} />
	<div class="preview-container">
		<h2>Original file preview</h2>
		{#await parentModal.app.vault.cachedRead(parentModal.originalFile)}
			<p>Loading preview...</p>
		{:then content}
			<div class="preview">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html marked(content, {
					mangle: false,
					headerIds: false,
				})}
			</div>
		{/await}
		<h2>Conflicting file preview</h2>
		{#await parentModal.app.vault.cachedRead(currentConflict)}
			<p>Loading preview...</p>
		{:then content}
			<div class="preview">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html marked(content, {
					mangle: false,
					headerIds: false,
				})}
			</div>
		{/await}
	</div>
</div>
<div class="tools">
	<button on:click={acceptConflict}> Accept conflict changes </button>
	<button on:click={acceptOriginal}> Accept original </button>
	<button on:click={openMergeEditor}> Open in Merge Editor </button>
</div>

<style>
	.column {
		display: inline-block;
		width: 33%;
		min-height: fit-content;
		max-height: 95%;
		vertical-align: top;
		overflow-y: scroll;
		padding: 1%;
	}
	.column h1 {
		margin-top: 0;
		text-align: center;
	}
	.conflicts {
		max-height: 650px;
		overflow-y: auto;
		padding: 1%;
	}
	.divider {
		margin-top: 10px;
		margin-bottom: 10px;
		border-bottom: 2px solid var(--background-modifier-border);
	}
	.tools {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		align-items: end;
	}
	.preview {
		border: 1px solid var(--background-modifier-border);
		border-radius: 5px;
		padding: 1%;
	}
	.preview-container {
		padding: 1%;
		overflow-y: scroll;
		height: 500px;
	}
	.diff_view {
		max-height: 650px;
		overflow-y: scroll;
	}
</style>
