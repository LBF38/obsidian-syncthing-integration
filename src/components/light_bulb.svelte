<script>
	import { useActor } from "@xstate/svelte";
	import { lightMachine } from "./machines";

	const { snapshot, send, actorRef } = useActor(lightMachine);
	actorRef.subscribe((snapshot) => console.log(snapshot));
</script>

<button on:click={() => send({ type: "TOGGLE" })}>
	{$snapshot.value === "on" ? "Turn Off" : "Turn On"}
</button>

<p>The light bulb is currently {$snapshot.value}</p>
