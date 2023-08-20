<script lang="ts">
	import { Notice } from "obsidian";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import { ConfigurationItemData } from "./types";

	export let title = "My Device's Name";
	export let data: ConfigurationItemData = [
		{
			icon: "download-cloud",
			title: "Download Rate",
		},
		{
			icon: "upload-cloud",
			title: "Upload Rate",
		},
		{
			icon: "home",
			title: "Local State (Total)",
		},
		{
			icon: "network",
			title: "Listeners",
		},
		{
			icon: "milestone",
			title: "Discovery",
		},
		{
			icon: "clock-9",
			title: "Uptime",
		},
		{
			icon: "qr-code",
			title: "Identification",
		},
		{
			icon: "tag",
			title: "Version",
		},
	];
</script>

<details>
	<summary><slot name="title">{title}</slot></summary>
	<table>
		<slot name="table">
			{#each data as item}
				<tr>
					<td>
						<div>
							<ObsidianLucideIcon
								name={item.icon}
								style="display: flex;"
							/>
							{item.title}
						</div>
					</td>
					<td>
						<slot {item}>
							{#if item.icon === data[0].icon}
								<a href="/" style="color: inherit;">
									0 B/s (0 B)
								</a>
							{:else if item.icon === data[1].icon}
								<a href="/" style="color: inherit;">
									0 B/s (0 B)
								</a>
							{:else if item.icon === data[2].icon}
								<span>
									Files: 100, Folders: 50, Storage: ~40 MiB
								</span>
							{:else if item.icon === data[3].icon}
								<span> 3/3 </span>
							{:else if item.icon === data[4].icon}
								<span> 4/5 </span>
							{:else if item.icon === data[5].icon}
								<span> 10h 23m </span>
							{:else if item.icon === data[6].icon}
								<a
									href="/"
									on:click={() =>
										new Notice("not implement yet !")}
								>
									HX4RNK
								</a>
							{:else if item.icon === data[7].icon}
								<span> v1.23.7, Windows, blabla</span>
							{:else}
								<span>Not implemented yet!</span>
							{/if}
						</slot>
					</td>
				</tr>
			{/each}
		</slot>
	</table>
	<slot name="footer" />
</details>

<style>
	details {
		padding: 1%;
		border-radius: var(--radius-l);
	}
	details:hover {
		background-color: var(--background-modifier-hover);
	}
	summary {
		list-style: none;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
		height: fit-content;
		background-color: var(--background-secondary-alt);
		padding: 1% 2%;
		border-radius: var(--radius-m);
	}
	details[open] summary {
		border-radius: 0;
		border-top-left-radius: var(--radius-m);
		border-top-right-radius: var(--radius-m);
	}
	table {
		width: 100%;
		background-color: var(--background-primary);
		border-collapse: collapse;
		border-spacing: 0;
		padding: 1%;
		border-radius: var(--radius-l);
	}
	table > tr:last-child td:first-child {
		border-bottom-left-radius: var(--radius-m);
	}
	table > tr:last-child td:last-child {
		border-bottom-right-radius: var(--radius-m);
	}
	table tr td {
		padding: 0.5em;
		/* pointer-events: none; */
	}
	tr:active,
	td:active {
		/* unset the default behaviour */
		position: static;
		background: none;
		width: auto;
		transition: none;
		transform: none;
		border-radius: 0;
	}
	table tr td div {
		vertical-align: middle;
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
	}
	table tr td:first-child {
		text-align: start;
		display: table-cell;
	}
	table tr td:last-child {
		text-align: end;
	}
	table tr:nth-child(odd) {
		background-color: var(--background-primary-alt);
	}
	table tr:nth-child(even) {
		background-color: var(--background-secondary);
	}
</style>
