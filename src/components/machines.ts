import { SyncthingFromREST } from 'src/data/syncthing_remote_datasource';
import { SyncthingConfiguration } from 'src/models/entities';
import { Output } from 'valibot';
import { assign, fromPromise, setup } from 'xstate';

const fetchConfiguration = fromPromise(async ({ input }: { input: { syncthingREST: SyncthingFromREST } }) => {
	return await input.syncthingREST.config.all();
});


export const syncthingConfigurationMachine = setup({
	types: {
		context: {} as {
			configuration?: Output<typeof SyncthingConfiguration>;
			syncthingREST: SyncthingFromREST;
			error?: string;
		}, input: {} as {
			syncthingREST: SyncthingFromREST;
		},
	},
}).createMachine({
	/** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiAD1gBd0GwT0AzFgJ2QEYAGQUWposeQqXJUA2vwC6iUAAcA9rFwNcK-IpC1EvAGyGSAJkEXD-AMwAWY7wCsAGhABPRKdMnbjwbwCADgBOK0NbAHYAXyjXURwCYhJ2MAYE-CgAAkxtdlwoAFcuZi18aghtVkZmVnjxJJS08Syc-DzC4s1tWQUkEFV1Lp0+-QRHa2sSSNtgiL9rR0D+XlcPBC8fP2Wg0P5w6NiQOsTSAqUIGuzc-KKS7WomLhgGHt0BjVLdUcdbXjNrCK2QK+cJ2CIrdyIQJ-awWAKmRwRQKmcGmGKHfAqCBwXTHCRvNQfbRfRAAWkMqzJvAiJHCwXphh+QN4S14MTiGHSSSkYAJg0+I0QtlMlIQgRMwUCE1sdhswRZy3ZR059VIjXSLWuHTuw2UhKGJPW4pIwPps2svGF5n4Lkh62WtK2vC88uF-FMtiVeKSZwuLCubRunQFev5xMFCH2JAmgNChnlwJlopCUyldll1gTisO3tIhAA7plqv7eHyibq9EL+MF-oDgY5QZFLaL447-C7LeYPeiokA */
	id: "syncthingConfiguration",
	context: ({ input }) => ({
		syncthingREST: input.syncthingREST,
		configuration: undefined,
	}),
	initial: "idle",
	states: {
		idle: {
			after: {
				1000: "fetching configuration",
			}
		},
		"fetching configuration": {
			invoke: {
				id: "fetchConfig",
				src: fetchConfiguration,
				input: ({ context: { syncthingREST } }) => ({ syncthingREST }),
				onDone: {
					target: "success",
					actions: assign({
						configuration: ({ event }) => {
							return event.output
						}
					})
				},
				onError: {
					target: "failure",
					actions: assign({
						error: () => {
							return "An error occured"
						}
					})
				}
			},
		},
		success: {
			on: {
				FETCH: "idle"
			}
		},
		failure: {
			on: {
				RETRY: "fetching configuration"
			}
		}
	},

})

export const lightMachine = setup({}).createMachine({
	/** @xstate-layout N4IgpgJg5mDOIC5QBsCWUAWAXAQgV2QCMA6AewDNyBiAFQHkBxBgGQFEBtABgF1FQAHUrFRZUpAHZ8QAD0QBGAGwLicgJzrVAdgBMAVm2cAHJ22aANCACe8gMydiGjdoAsczs8ObDAX28W0mLgEJBK0jCwcPFKCwqISUrIIispqGjr6RibmVoiGcsTajjY2upqcqh66vn4g4qQQcFIB2PhE0UIiYpJIMogAtAoW1ggDxJzjE5OTmr7+6C3BZJTtsV0JiM7aQ7nKqobFhZq6hoZanHKzIM1BRGTdAh1x970I2qfEmnIuqiZ2ngoVbYId4eA5aY6nMoXapAA */
	id: 'lightBulb',
	initial: 'off',
	states: {
		off: {
			on: {
				TOGGLE: 'on'
			}
		},
		on: {
			on: {
				TOGGLE: 'off'
			}
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
