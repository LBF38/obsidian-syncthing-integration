<script lang="ts">
	import { unifiedMergeView } from "@codemirror/merge";
	import { Annotation, Transaction } from "@codemirror/state";
	import { EditorView, basicSetup } from "codemirror";
	import { ButtonComponent, Notice } from "obsidian";
	import { CodeMirrorEditorModal } from "src/views/codemirror_editor";
	import { onDestroy, onMount } from "svelte";
	export let cmEditorModal: CodeMirrorEditorModal;

	let mergeEditorContainer: HTMLDivElement;
	let resultEditorContainer: HTMLDivElement;
	let toolsEl: HTMLDivElement;
	let unifiedEditor: EditorView;
	let resultEditor: EditorView;
	console.log("cmEditorModal", cmEditorModal);

	onMount(async () => {
		unifiedEditor = new EditorView({
			doc: await cmEditorModal.app.vault.read(cmEditorModal.originalFile),
			extensions: [
				basicSetup,
				EditorView.darkTheme.of(true),
				EditorView.lineWrapping,
				unifiedMergeView({
					original: await cmEditorModal.app.vault.read(
						cmEditorModal.modifiedFile
					),
					gutter: true,
					mergeControls: true,
				}),
				EditorView.updateListener.of((update) => {
					if (
						update.docChanged &&
						update.startState.doc !== update.state.doc
					)
						console.log(
							"\nupdateListener",
							update,
							"\ndocChanged ?",
							update.docChanged,
							"\nstartState",
							update.startState,
							"\nstate",
							update.state
						);
				}),
			],
			dispatch: (transaction) =>
				syncDispatch(transaction, unifiedEditor, resultEditor),
			parent: mergeEditorContainer,
		});

		resultEditor = new EditorView({
			doc: await cmEditorModal.app.vault.read(cmEditorModal.modifiedFile),
			extensions: [
				basicSetup,
				EditorView.darkTheme.of(true),
				EditorView.lineWrapping,
			],
			dispatch: (transaction) =>
				syncDispatch(transaction, resultEditor, unifiedEditor),
			parent: resultEditorContainer,
		});
		new ButtonComponent(toolsEl).setIcon("checkmark").onClick(() => {
			console.log(
				"saved content to file from unifiedEditor:\n",
				unifiedEditor.state.doc
			);
			new Notice("TODO: Save changes");
			// cmEditorModal.modifiedContent = unifiedEditor.state.doc.toString();
			// cmEditorModal.close();
		});
		new ButtonComponent(toolsEl)
			.setIcon("cross")
			.setTooltip("Cancel")
			.onClick(() => {
				new Notice("TODO: Revert changes");
				// cmEditorModal.close();
			});
		new ButtonComponent(toolsEl).setIcon("pencil").onClick(() => {
			new Notice("TODO: Edit in CodeMirror");
		});
	});

	const syncAnnotation = Annotation.define<boolean>();

	function syncDispatch(
		transaction: Transaction,
		view: EditorView,
		...others: EditorView[]
	) {
		view.update([transaction]);
		if (
			!transaction.changes.empty &&
			!transaction.annotation(syncAnnotation)
		) {
			const annotations: Annotation<string | boolean>[] = [
				syncAnnotation.of(true),
			];
			const userEvent = transaction.annotation(Transaction.userEvent);
			if (userEvent)
				annotations.push(Transaction.userEvent.of(userEvent));
			others.map((editor) =>
				editor.dispatch({
					changes: transaction.changes,
					annotations,
				})
			);
			// console.log("syncDispatch", transaction.changes);
		}
	}

	onDestroy(() => {
		unifiedEditor.destroy();
		resultEditor.destroy();
	});
</script>

<div
	bind:this={mergeEditorContainer}
	class="syncthing-codemirror-editor-container"
/>
<div
	bind:this={resultEditorContainer}
	class="syncthing-codemirror-editor-container"
/>
{#if unifiedEditor}
	<div class="preview">{unifiedEditor.state.doc.toString()}</div>
{/if}
<div bind:this={toolsEl} class="syncthing-codemirror-editor-tools" />

<style>
	* {
		width: 100%;
		height: 100%;
	}
</style>
