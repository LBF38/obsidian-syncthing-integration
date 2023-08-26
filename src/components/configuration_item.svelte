<script lang="ts">
	import { Notice } from "obsidian";
	import { SyncthingDevice, SyncthingFolder } from "src/models/entities";
	import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";
	import { Output } from "valibot";

	export let folder: Output<typeof SyncthingFolder> | undefined = undefined;
	export let device: Output<typeof SyncthingDevice> | undefined = undefined;
	export let isThisDevice = false;
</script>

<details>
	<summary>
		<slot name="title">
			<ObsidianLucideIcon name="hard-drive" />
			<span>{device?.name ?? device?.deviceID}</span>
		</slot>
	</summary>
	<table>
		{#if folder && !isThisDevice}
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="info" />
						<span>Folder ID</span>
					</div>
				</td>
				<td>
					<span>{folder.id}</span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="folder" />
						<span>Folder Path</span>
					</div>
				</td>
				<td>
					<span>{folder.path}</span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="globe-2" />
						<span>Global State</span>
					</div>
				</td>
				<td>
					<!-- TODO: change to dynamic data. -->
					<span> Files: 100, Folders: 50, Storage: ~40 MiB </span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="home" />
						<span>Local State</span>
					</div>
				</td>
				<td>
					<!-- TODO: change to dynamic data. -->
					<span> Files: 100, Folders: 50, Storage: ~40 MiB </span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="refresh-cw" />
						<span>Rescans</span>
					</div>
				</td>
				<td>
					<!-- TODO: change to dynamic data. -->
					<div>
						<ObsidianLucideIcon name="clock-9" />
						<span>1h</span>
						<ObsidianLucideIcon name="eye" />
						<span>Enabled</span>
					</div>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="file" />
						<span>File Versioning</span>
					</div>
				</td>
				<td>
					<!-- TODO: change to dynamic data. -->
					<span>Staggered</span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="share-2" />
						<span>Shared With</span>
					</div>
				</td>
				<td>
					<!-- TODO: map to device names and remove this device. -->
					<span>
						{folder.devices
							.map((device) => device.deviceID.slice(0, 7))
							.join(", ")}
					</span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="clock-9" />
						<span>Last Scan</span>
					</div>
				</td>
				<td>
					<!-- TODO: change to dynamic/real data. -->
					<span>{new Date().toISOString()}</span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="arrow-left-right" />
						<span>Latest Change</span>
					</div>
				</td>
				<td>
					<span>{"Updated <filename>.ext"}</span>
				</td>
			</tr>
		{:else if device && !isThisDevice}
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="eye" />
						<span>Last seen</span>
					</div>
				</td>
				<td>
					<!-- TODO: change to dynamic data. -->
					<span>{new Date().toString()}</span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="cloud" />
						<span>Sync Status</span>
					</div>
				</td>
				<td>
					<!-- TODO: change to dynamic data. -->
					<span>up to date</span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="link" />
						<span>Addresses</span>
					</div>
				</td>
				<td>
					<span>{device.addresses.join(", ")}</span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="qr-code" />
						<span>Identification</span>
					</div>
				</td>
				<td>
					<a
						href="/"
						on:click={() => {
							new Notice("Not implemented yet!");
						}}
					>
						{device.deviceID.slice(0, 7)}
					</a>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="folder" />
						<span>Folders</span>
					</div>
				</td>
				<td>
					<span>{device.name}</span>
				</td>
			</tr>
		{:else if isThisDevice && device}
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="download-cloud" />
						<span>Download Rate</span>
					</div>
				</td>
				<td>
					<a href="/" style="color: inherit;"> 0 B/s (0 B) </a>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="upload-cloud" />
						<span>Upload Rate</span>
					</div>
				</td>
				<td>
					<a href="/" style="color: inherit;"> 0 B/s (0 B) </a>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="home" />
						<span>Local State (Total)</span>
					</div>
				</td>
				<td>
					<span> Files: 100, Folders: 50, Storage: ~40 MiB </span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="network" />
						<span>Listeners</span>
					</div>
				</td>
				<td>
					<span> 3/3 </span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="milestone" />
						<span>Discovery</span>
					</div>
				</td>
				<td>
					<span> 4/5 </span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="clock-9" />
						<span>Uptime</span>
					</div>
				</td>
				<td>
					<span> 10h 23m </span>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="qr-code" />
						<span>Identification</span>
					</div>
				</td>
				<td>
					<a
						href="/"
						on:click={() => new Notice("not implement yet !")}
					>
						{device.deviceID.slice(0, 7)}
					</a>
				</td>
			</tr>
			<tr>
				<td>
					<div>
						<ObsidianLucideIcon name="tag" />
						<span>Version</span>
					</div>
				</td>
				<td>
					<span> v1.23.7, Windows, blabla</span>
				</td>
			</tr>
		{/if}
	</table>
	<slot name="footer" class="footer">
		{#if folder && !isThisDevice}
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="pause" />
				<span>Pause</span>
			</button>
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="history" />
				<span>Versions</span>
			</button>
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="refresh-cw" />
				<span>Rescan</span>
			</button>
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="pencil" />
				<span>Edit</span>
			</button>
		{:else if device && !isThisDevice}
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="pause" />
				<span>Pause</span>
			</button>
			<button
				on:click={async (event) => {
					new Notice("Not implemented yet!");
				}}
			>
				<ObsidianLucideIcon name="pencil" />
				<span>Edit</span>
			</button>
		{/if}
	</slot>
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
