<script lang="ts">
	import { MergeView } from "@codemirror/merge";
	import { EditorState } from "@codemirror/state";
	import { EditorView, basicSetup } from "codemirror";
	import { onMount } from "svelte";

	let divEditor: HTMLDivElement;
	let mergeEditorEl: HTMLDivElement;

	let originalContent = "Original Content";
	let modifiedContent = "Modified Content";
	let editorContent: string = "Hello World";
	let editor: EditorView;
	let mergeEditor: MergeView;

	onMount(() => {
		editor = new EditorView({
			doc: editorContent,
			extensions: [basicSetup, EditorView.darkTheme.of(true)],
			parent: divEditor,
		});
		mergeEditor = new MergeView({
			a: {
				doc: originalContent,
				extensions: [basicSetup, EditorView.darkTheme.of(true)],
			},
			b: {
				doc: modifiedContent,
				extensions: [
					basicSetup,
					EditorView.editable.of(false),
					EditorState.readOnly.of(true),
					EditorView.darkTheme.of(true),
				],
			},
			parent: mergeEditorEl,
		});
	});
	$: console.log("editorContent", editor?.state);

	// document.insertAfter(document.body, editor.dom);
	let text = "Hello World";
</script>

<h1>This is the diff editor.</h1>
<textarea bind:value={text} />
<p>{@html text}</p>
<!-- {@html editor.dom} -->
<div bind:this={divEditor} class="container" />
<div bind:this={mergeEditorEl} class="container" />

<style>
	.container {
		width: 100%;
		height: 100%;
	}
</style>
