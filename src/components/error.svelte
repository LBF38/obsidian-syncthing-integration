<script lang="ts">
	import { Failure } from "src/models/failures";

	export let failure: Failure | { message: string }; // For the error message
</script>

<p>
	A failure occured :
	{failure.message}
</p>

<style>
	p {
		background-color: darkred;
		opacity: 0.6;
		border-radius: 10px;
		box-shadow: black 0px 0px 10px;
		padding: 1%;
	}
</style>
