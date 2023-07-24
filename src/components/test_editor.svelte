<script lang="ts">
	import { MergeView } from "@codemirror/merge";
	import { EditorState, Text } from "@codemirror/state";
	import { EditorView, basicSetup } from "codemirror";
	import { Editor } from "obsidian";
	import { onMount } from "svelte";

	// TODO: implement logic for diff editor.
	// Objectif : recréer, de manière simple, un 3-way editor.
	export let originalContent: string = "this is the original text";
	export let modifiedContent: string = "this is the modified text";
	let mergeEditor: MergeView;
	let mergeEditorContainer: HTMLDivElement;
	let resultEditor: EditorView;
	let resultEditorContainer: HTMLDivElement;
	let contentEditorA: Text;
	let contentEditorB: Text;

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
				],
			},
			parent: mergeEditorContainer,
		});
		resultEditor = new EditorView({
			doc: contentEditorA,
			extensions: [
				basicSetup,
				EditorView.lineWrapping,
				EditorView.darkTheme.of(true),
			],
			parent: resultEditorContainer,
		});
	});
</script>

<div class="diff" bind:this={mergeEditorContainer} />
{#if contentEditorA}
	<div>{@html contentEditorA.toString()}</div>
{/if}

<style>
	/* TODO: Add style for diff editor. If necessary. */
</style>
