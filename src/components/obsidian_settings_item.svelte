<script lang="ts">
	export let name = "";
	export let description = "";
	export let heading = false;
	export let error = false;
	let className = "";
	export { className as class };
</script>

<div class="setting-item {className}" class:setting-item-heading={heading}>
	<div class="setting-item-info">
		<div class="setting-item-name" class:error>
			<slot name="name">{name}</slot>
		</div>
		<div class="setting-item-description" class:error>
			<slot name="description">{description}</slot>
		</div>
	</div>
	<div class="setting-item-control">
		<slot name="control" />
	</div>
</div>

<style>
	.error {
		color: var(--text-error);
	}
</style>
