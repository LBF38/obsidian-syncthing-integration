import { SyncthingConfiguration } from 'src/models/entities';
import { Output } from 'valibot';
import { createActor, createMachine, fromPromise, setup } from 'xstate';
const machine = createMachine({
	/** @xstate-layout N4IgpgJg5mDOIC5QFsCGBjAFgSwHZgDpsIAbMAYgGEAZASUoGkBtABgF1FQAHAe1mwAu2Hrk4gAHogCMANhkEATC2VSWAdgUAOTQGYArNoA0IAJ7TNLAjICct2yz061amQr0Bfd8bRY8hEjyoEHhQ5ABKAKIAygDy1ABqEawcSCC8-EIiYpIIACwOBA7KOjK6Uta5uTLGZghSOjoEuXbW2noKMqoynt4YOPgEAUEh4REAUhGUACrJYumCwqKpObLySirqWroGmjWImlKKLZoyelKVzQo9ID79hGAATg88D1R0jLOp85lLoCtyimULFUGm0+iMpmkOksLVamnanRY3WuuB4EDgYlufjmfAWWWWiAAtNVIQhiYUgZSqeprliBsQyDiMotsohcgo9nULAQ1LDKlIlDJKrS+n5BoFgrgoEy8b8JIgtHoCPDlB1VDpVJo1Jz6o09LCFPkWPlnCLfANYABXdDoODwL64n6shCOXLKtwOJR6V0anU6BQEHTNOxuE4yDRXLw3UUDR7PB4yp0EvIc0knAitBr+hQufUdZGeIA */
	id: "machine",
	initial: "idle",
	invoke: [{ src: "fetchUser" }],
	states: {
		idle: {
			on: {
				MATCH: "loading"
			}
		},
		loading: {
			on: {
				RESOLVE: "success",
				REJECT: "error"
			}
		},
		success: {
			type: "final"
		},
		error: {
			on: {
				CLICK: "loading"
			}
		}
	},
}, {
	actors: {
		fetchUser: fromPromise(() => fetch("https://jsonplaceholder.typicode.com/users/1").then(res => res.json()))
	}
});


const actor = createActor(machine);
actor.subscribe((snapshot) => {
	console.log(snapshot);
})
actor.start();


export const other = createMachine({
	/** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiAD1gBd0GwT0AzFgJ2QEYAGQUWposeQqXJUA2vwC6iUAAcA9rFwNcK-IpC1EvAGyGSAJkEXD-AMwAWY7wCsAGhABPRKdMnbjwbwCADgBOK0NbAHYAXyjXURwCYhJ2MAYE-CgAAkxtdlwoAFcuZi18aghtVkZmVnjxJJS08Syc-DzC4s1tWQUkEFV1Lp0+-QRHa2sSSNtgiL9rR0D+XlcPBC8fP2Wg0P5w6NiQOsTSAqUIGuzc-KKS7WomLhgGHt0BjVLdUcdbXjNrCK2QK+cJ2CIrdyIQJ-awWAKmRwRQKmcGmGKHfAqCBwXTHCRvNQfbRfRAAWkMqzJvAiJHCwXphh+QN4S14MTiGHSSSkYAJg0+I0QtlMlIQgRMwUCE1sdhswRZy3ZR059VIjXSLWuHTuw2UhKGJPW4pIwPps2svGF5n4Lkh62WtK2vC88uF-FMtiVeKSZwuLCubRunQFev5xMFCH2JAmgNChnlwJlopCUyldll1gTisO3tIhAA7plqv7eHyibq9EL+MF-oDgY5QZFLaL447-C7LeYPeiokA */
	context: {} as {
		configuration: Output<typeof SyncthingConfiguration>;
	},
	initial: "idle",
	states: {
		idle: {
			after: {
				1000: "fetching configuration",
			}
		},
		"fetching configuration": {
			invoke: {
				src: "fetchConfiguration",
			},
			onDone: "update configuration",
		},
		"update configuration": {
			on: {
				target: "idle",
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
