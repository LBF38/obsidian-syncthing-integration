<script lang="ts">
	export let title = "Warning";
	export let message: string;
	export let dismiss = false;
</script>

{#if !dismiss}
	<div
		data-callout-metadata=""
		data-callout-fold=""
		data-callout="warning"
		class="callout"
	>
		<div class="callout-title">
			<div class="callout-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="svg-icon lucide-alert-triangle"
				>
					<path
						d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
					/>
					<line x1="12" y1="9" x2="12" y2="13" />
					<line x1="12" y1="17" x2="12.01" y2="17" />
				</svg>
			</div>
			<div class="callout-title-inner">{title}</div>
			<div
				role="button"
				tabindex="0"
				aria-roledescription="Dismiss"
				on:keypress={() => (dismiss = !dismiss)}
				on:click={() => (dismiss = !dismiss)}
				class="close-button"
			/>
		</div>
		<div class="callout-content">
			<p>{message}</p>
		</div>
	</div>
{/if}

<style>
	.close-button {
		margin-left: auto;
		cursor: var(--cursor);
		/* position: absolute; */
		/* top: var(--size-2-3);
		right: var(--size-2-3); */
		font-size: 24px;
		line-height: 20px;
		/* height: 24px;
		width: 24px; */
		padding: var(--size-2-2);
		border-radius: var(--radius-s);
		color: var(--text-muted);
		&:before {
			font-family: Inter, sans-serif;
			content: "\D7";
			font-weight: 300;
		}
		&:hover {
			background-color: var(--background-modifier-hover);
			color: var(--text-normal);
		}
	}
</style>
