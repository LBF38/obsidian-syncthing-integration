// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SyncthingFromAndroid } from "./syncthing_android_datasource";

const APP_URL = "syncthing://com.nutomic.syncthingandroid";
const STORE_URL =
	"https://play.google.com/store/apps/details?id=com.nutomic.syncthingandroid";

let originalLocation: Location;
let android: SyncthingFromAndroid;

beforeEach(() => {
	vi.spyOn(console, "log").mockImplementation(() => {});
	originalLocation = window.location;
	Object.defineProperty(window, "location", {
		configurable: true,
		writable: true,
		value: { href: "" },
	});
	android = new SyncthingFromAndroid();
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
	Object.defineProperty(window, "location", {
		configurable: true,
		writable: true,
		value: originalLocation,
	});
});

describe("SyncthingFromAndroid.hasSyncthing", () => {
	it("always resolves to true in the current implementation", async () => {
		await expect(android.hasSyncthing()).resolves.toBe(true);
	});
});

describe("SyncthingFromAndroid.openSyncthing", () => {
	it("opens the app and redirects to the store on timeout", async () => {
		vi.useFakeTimers();
		const addEventListener = vi.spyOn(document, "addEventListener");

		await expect(android.openSyncthing()).resolves.toBe(true);

		expect(window.location.href).toBe(APP_URL);
		expect(addEventListener).toHaveBeenCalledWith(
			"visibilitychange",
			expect.any(Function),
		);

		vi.advanceTimersByTime(2000);

		expect(window.location.href).toBe(STORE_URL);
	});

	it("clears the redirect when the app becomes visible", async () => {
		vi.useFakeTimers();

		await android.openSyncthing();

		document.dispatchEvent(new Event("visibilitychange"));
		vi.advanceTimersByTime(2000);

		expect(window.location.href).toBe(APP_URL);
	});
});
