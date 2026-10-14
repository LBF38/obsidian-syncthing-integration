// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import ObsidianToggle from "./obsidian_toggle.svelte";

afterEach(cleanup);

describe("obsidian_toggle.svelte", () => {
	it("mounts a toggle and forwards changes to the callback", async () => {
		const callback = vi.fn();
		const { container } = render(ObsidianToggle, {
			props: { callback },
		});
		await tick();

		const input = container.querySelector("input") as HTMLInputElement;
		expect(input).not.toBeNull();

		input.checked = true;
		await fireEvent.change(input);

		expect(callback).toHaveBeenCalledWith(true);
	});
});
