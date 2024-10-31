import { SyncthingFromREST } from 'src/data/syncthing_remote_datasource';
import { SyncthingConfiguration, SyncthingSystemStatus } from 'src/models/entities';
import { Output } from 'valibot';
import { assign, fromPromise, log, setup } from 'xstate';

const fetchConfiguration = fromPromise(async ({ input }: { input: { syncthingREST: SyncthingFromREST } }) => {
	return await input.syncthingREST.config.all();
});

const fetchSystemStatus = fromPromise(async ({ input }: { input: { syncthingREST: SyncthingFromREST } }) => {
	return await input.syncthingREST.system.status();
});


const updateSyncthingMachine = setup({
	types: {
		context: {} as {
			system_status?: Output<typeof SyncthingSystemStatus>;
			configuration?: Output<typeof SyncthingConfiguration>;
			syncthingREST: SyncthingFromREST;
		},
		input: {} as {
			syncthingREST: SyncthingFromREST;
		}
	}
}).createMachine({
	id: "updateSyncthing",
	context: ({ input }) => ({
		system_status: undefined,
		configuration: undefined,
		syncthingREST: input.syncthingREST,
	}),
	initial: "update data",
	states: {
		"update data": {
			invoke: [
				{
					src: fetchConfiguration,
					input: ({ context: { syncthingREST } }) => ({ syncthingREST }),
					onDone: {
						actions: assign({
							configuration: ({ event }) => {
								return event.output
							}
						}),
					},
				},
				{
					src: fetchSystemStatus,
					input: ({ context: { syncthingREST } }) => ({ syncthingREST }),
					onDone: {
						actions: assign({
							system_status: ({ event }) => {
								return event.output
							}
						})
					}
				}
			],
			always: {
				guard: ({ context: { system_status, configuration } }) => {
					return !!(system_status && configuration)
				},
				target: "success"
			}
		},
		success: {
			type: "final",
			output: ({ context }) => context
		}
	}
});

// useful example here: https://github.com/statelyai/xstate/blob/main/examples/workflow-car-vitals/main.ts
export const syncthingControllerMachine = setup({
	types: {
		context: {} as {
			syncthingREST: SyncthingFromREST;
		},
		input: {} as {
			syncthingREST: SyncthingFromREST;
		},
	}
}).createMachine({
	id: "syncthingController",
	context: ({ input }) => ({
		syncthingREST: input.syncthingREST,
		configuration: undefined,
	}),
	initial: "idle",
	states: {
		idle: {
			on: {
				StartUpdateSyncthing: "update syncthing",
			},
		},
		"update syncthing": {
			invoke: [
				{
					src: updateSyncthingMachine,
					input: ({ context: { syncthingREST } }) => ({ syncthingREST }),
					onDone: {
						actions: ({ event }) => {
							console.log(event.output)
						},
						target: "WaitUntilNextUpdate"
					},
				},
			],
			// onDone: {
			// 	guard: ({ context: { error } }) => error?.length === 0 || error === undefined,
			// 	target: "success"
			// },
		},
		WaitUntilNextUpdate: {
			after: {
				1000: "update syncthing",
			}
		},
		// success: {
		// 	type: "final",
		// },
		// failure: {
		// 	on: {
		// 		RETRY: "update syncthing"
		// 	}
		// }
	},
	on: {
		StopUpdateSyncthingEvent: {
			actions: log("StopUpdateSyncthingEvent"),
			target: "idle"
		}
	}
});


/* Utils */
import type { AnyMachineSnapshot } from 'xstate';

export function getNextEvents(snapshot: AnyMachineSnapshot) {
	return [...new Set([...snapshot._nodes.flatMap((sn) => sn.ownEvents)])];
}

// Instead of `state.nextEvents`:
// const nextEvents = getNextEvents(state);
