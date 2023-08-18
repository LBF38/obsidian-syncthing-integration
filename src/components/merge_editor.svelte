<script lang="ts">
	import { MergeView } from "@codemirror/merge";
	import { EditorState, Text } from "@codemirror/state";
	import { EditorView, basicSetup } from "codemirror";
	import { marked } from "marked";
	import { ButtonComponent, Notice } from "obsidian";
	import { ConfirmModal } from "src/views/confirm_modal";
	import { MergeModal } from "src/views/merge_editor";
	import { onMount } from "svelte";

	export let originalContent = "this is the original text";
	export let modifiedContent = "this is the modified text";
	export let parentModal: MergeModal;
	let mergeEditor: MergeView;
	let mergeEditorContainer: HTMLDivElement;
	let contentEditorA: Text;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let contentEditorB: Text;
	let toolsContainer: HTMLDivElement;

	onMount(() => {
		mergeEditor = new MergeView({
			a: {
				doc: originalContent,
				extensions: [
					basicSetup,
					EditorView.lineWrapping,
					EditorView.darkTheme.of(true),
					EditorView.updateListener.of((viewUpdate) => {
						if (viewUpdate.docChanged) {
							contentEditorA = viewUpdate.state.doc;
						}
					}),
				],
			},
			b: {
				doc: modifiedContent,
				extensions: [
					basicSetup,
					EditorView.lineWrapping,
					EditorView.darkTheme.of(true),
					EditorView.updateListener.of((viewUpdate) => {
						if (viewUpdate.docChanged) {
							contentEditorB = viewUpdate.state.doc;
						}
					}),
					EditorView.editable.of(false),
					EditorState.readOnly.of(true),
				],
			},
			revertControls: "b-to-a",
			parent: mergeEditorContainer,
		});
		new ButtonComponent(toolsContainer)
			.setButtonText("Save merged file")
			.setCta()
			.onClick(async () => {
				if (mergeEditor.chunks.length > 0) {
					new Notice(
						"There is still some merge conflicts. Please resolve them."
					);
					new ConfirmModal(
						parentModal.app,
						"Are you sure you want to save the file?\nThere are still some merge conflicts.\nThis action will save the previewed file in the original file and delete the conflicting file.",
						async () => {
							new Notice("Saved file");
							await parentModal.app.vault.delete(
								parentModal.modifiedFile
							);
							new Notice("Deleted conflicting file");
							parentModal.close();
						}
					).open();
					return;
				}
				await parentModal.app.vault.modify(
					parentModal.originalFile,
					contentEditorA.toString()
				);
				new Notice("Saved file");
				await parentModal.app.vault.delete(parentModal.modifiedFile);
				new Notice("Deleted conflicting file");
				parentModal.close();
			}).buttonEl.style.margin = "1%";
		new ButtonComponent(toolsContainer)
			.setButtonText("Cancel merge")
			.setWarning()
			.onClick(() => {
				if (mergeEditor.chunks.length > 0) {
					new Notice(
						"There is still some merge conflicts. Please resolve them."
					);
					new ConfirmModal(
						parentModal.app,
						"Are you sure you want to cancel the merge?\nThere are still some merge conflicts.\nThis will keep the original file and the conflicting file.",
						() => {
							new Notice("Closing the merge editor.");
							parentModal.close();
						}
					).open();
					return;
				}
				new ConfirmModal(
					parentModal.app,
					"Are you sure you want to cancel the merge?\nYou have resolved the conflicts but your modifications will not be saved.\nThis will keep the original file and the conflicting file.",
					() => {
						new Notice("Closing the merge editor.");
						parentModal.close();
					}
				).open();
			}).buttonEl.style.margin = "1% 0";
	});
</script>

<div class="merge" bind:this={mergeEditorContainer} />

<h3>Preview the merged file</h3>
<div class="preview">
	{#if contentEditorA}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html marked(contentEditorA.toString(), {
			mangle: false,
			headerIds: false,
		})}
	{:else}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html marked(originalContent, {
			mangle: false,
			headerIds: false,
		})}
	{/if}
</div>

<div bind:this={toolsContainer} class="tools" />

<style>
	.merge {
		border-radius: 5px;
		height: 35%;
		overflow: scroll;
	}

	.preview {
		border: 1px solid var(--background-modifier-border);
		border-radius: 5px;
		height: 35%;
		overflow: scroll;
		padding: 1%;
	}

	.tools {
		display: flex;
		flex-direction: row;
		justify-content: end;
		align-items: center;
	}
</style>
