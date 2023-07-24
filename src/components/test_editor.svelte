<script lang="ts">
	import { MergeView } from "@codemirror/merge";
	import { Text } from "@codemirror/state";
	import { EditorView, basicSetup } from "codemirror";
	import { marked } from "marked";
	import { ButtonComponent, Modal, Notice } from "obsidian";
	import { onMount } from "svelte";

	// TODO: implement logic for diff editor.
	// Objectif : recréer, de manière simple, un 3-way editor.
	export let originalContent: string = "this is the original text";
	export let modifiedContent: string = "this is the modified text";
	export let parentModal: Modal;
	let mergeEditor: MergeView;
	let mergeEditorContainer: HTMLDivElement;
	let contentEditorA: Text;
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
							console.log("viewUpdate A", viewUpdate);
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
							console.log("viewUpdate B", viewUpdate);
							contentEditorB = viewUpdate.state.doc;
						}
					}),
					EditorView.editable.of(false),
				],
			},
			parent: mergeEditorContainer,
		});
		new ButtonComponent(toolsContainer)
			.setButtonText("Save merged file")
			.setCta()
			.onClick(() => {
				if (mergeEditor.chunks.length > 0) {
					new Notice(
						"There is still some merge conflicts. Please resolve them."
					);
					return;
				}
				new Notice("Saved file");
				console.log("contentEditorA", contentEditorA.toString());
				console.log("contentEditorB", contentEditorB.toString());
			}).buttonEl.style.margin = "1%";
		new ButtonComponent(toolsContainer)
			.setButtonText("Cancel merge")
			.setWarning()
			.onClick(() => {
				if (mergeEditor.chunks.length > 0) {
					new Notice(
						"There is still some merge conflicts. Please resolve them."
					);
					return;
				}
				new Notice("Closing the merge editor.");
				parentModal.close();
			}).buttonEl.style.margin = "1% 0";
	});
</script>

<div class="diff" bind:this={mergeEditorContainer} />

<h3>Preview the merged file</h3>
<div class="review">
	{#if contentEditorA}
		{@html marked(contentEditorA.toString(), {
			mangle: false,
			headerIds: false,
		})}
	{:else}
		{@html marked(originalContent, {
			mangle: false,
			headerIds: false,
		})}
	{/if}
</div>

<div bind:this={toolsContainer} class="tools" />

<style>
	/* TODO: Add style for diff editor. If necessary. */
	.diff {
		border-radius: 5px;
		/* min-height: 20%; */
		height: 35%;
		/* margin: 2%; */
		overflow: scroll;
	}

	.review {
		background-color: gray;
		color: black;
		border-radius: 5px;
		/* min-height: 20%; */
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
