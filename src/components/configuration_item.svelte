<script lang="ts">
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import { ConfigurationItemData } from "./types";

	export let title = "My Device's Name";
	export let data: ConfigurationItemData = [
		{
			icon: "download-cloud",
			title: "Download Rate",
			information: "0 B/s (0 B)",
		},
		{
			icon: "upload-cloud",
			title: "Upload Rate",
			information: "0 B/s (0 B)",
		},
		{
			icon: "home",
			title: "Local State (Total)",
			information: "Files: 189, Folders: 16, Storage: ~ 39,6 MiB",
		},
		{
			icon: "network",
			title: "Listeners",
			information: "3/3",
		},
		{
			icon: "milestone",
			title: "Discovery",
			information: "4/5",
		},
		{
			icon: "clock-9",
			title: "Uptime",
			information: "1h 8m 0s",
		},
		{
			icon: "qr-code",
			title: "Identification",
			information: "HX4RNK",
		},
		{
			icon: "tag",
			title: "Version",
			information: "v1.23.7, blabla",
		},
	];
</script>

<details>
	<summary><slot name="title">{title}</slot></summary>
	<table>
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
				<td>{item.information}</td>
			</tr>
		{/each}
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
		pointer-events: none;
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
