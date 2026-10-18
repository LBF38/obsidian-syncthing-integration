import { describe, expect, it } from "vitest";
import { safeParse } from "valibot";
import { readFixtureJson } from "../../test/helpers/fixtures";
import {
	ConfigSaved,
	Failure,
	StartupComplete,
	StateChanged,
	SyncthingEventTypes,
	UnionSyncthingEvents,
} from "./syncthing_events";

describe("SyncthingEventTypes", () => {
	it("accepts the documented event types", () => {
		for (const type of [
			"ConfigSaved",
			"StateChanged",
			"StartupComplete",
			"LocalChangeDetected",
			"RemoteChangeDetected",
		]) {
			expect(safeParse(SyncthingEventTypes, type).success).toBe(true);
		}
	});

	it("rejects an unknown event type", () => {
		expect(safeParse(SyncthingEventTypes, "NothingHappened").success).toBe(
			false,
		);
	});
});

describe("UnionSyncthingEvents", () => {
	it("parses a StateChanged event and converts its time to a Date", () => {
		const result = safeParse(UnionSyncthingEvents, {
			id: 1,
			globalID: 1,
			type: "StateChanged",
			time: "2024-01-01T00:00:00Z",
			data: {
				folder: "default",
				from: "scanning",
				duration: 1.5,
				to: "idle",
			},
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.type).toBe("StateChanged");
		expect(result.output.time).toBeInstanceOf(Date);
	});

	it("parses a StartupComplete event whose data is null", () => {
		const result = safeParse(UnionSyncthingEvents, {
			id: 2,
			globalID: 2,
			type: "StartupComplete",
			time: "2024-01-01T00:00:00Z",
			data: null,
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.data).toBeNull();
	});

	it("parses a Failure event whose data is a plain string", () => {
		const result = safeParse(Failure, {
			id: 3,
			globalID: 3,
			type: "Failure",
			time: "2024-01-01T00:00:00Z",
			data: "something went wrong",
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.data).toBe("something went wrong");
	});

	it("parses a ConfigSaved event carrying a full configuration", () => {
		const result = safeParse(ConfigSaved, {
			id: 4,
			globalID: 4,
			type: "ConfigSaved",
			time: "2024-01-01T00:00:00Z",
			data: readFixtureJson("config.json"),
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.data.folders).toHaveLength(2);
	});

	it("rejects an event that is missing the generic fields", () => {
		expect(
			safeParse(UnionSyncthingEvents, {
				type: "StartupComplete",
				time: "2024-01-01T00:00:00Z",
				data: null,
			}).success,
		).toBe(false);
	});

	it("rejects an event whose type and payload do not match", () => {
		expect(
			safeParse(StateChanged, {
				id: 5,
				globalID: 5,
				type: "StartupComplete",
				time: "2024-01-01T00:00:00Z",
				data: { folder: "default" },
			}).success,
		).toBe(false);
	});
});

describe("SyncthingGenericEvent (via a typed event)", () => {
	it("keeps the numeric identifiers and the event type literal", () => {
		const result = safeParse(StartupComplete, {
			id: 7,
			globalID: 9,
			type: "StartupComplete",
			time: "2024-01-01T00:00:00Z",
			data: null,
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.output.id).toBe(7);
		expect(result.output.globalID).toBe(9);
		expect(result.output.type).toBe("StartupComplete");
	});
});
