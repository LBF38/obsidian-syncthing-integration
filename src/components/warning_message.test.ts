// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import WarningMessage from "./warning_message.svelte";

afterEach(cleanup);

describe("warning_message.svelte", () => {
	it("renders a warning callout with the message", () => {
		const { container } = render(WarningMessage, {
			props: { message: "careful now" },
		});

		expect(
			container.querySelector('[data-callout="warning"]'),
		).not.toBeNull();
		expect(container.textContent).toContain("Warning");
		expect(container.textContent).toContain("careful now");
	});

	it("uses a custom title", () => {
		const { container } = render(WarningMessage, {
			props: { title: "Heads up", message: "careful now" },
		});

		expect(container.textContent).toContain("Heads up");
	});

	it("does not render when dismissed from the start", () => {
		const { container } = render(WarningMessage, {
			props: { message: "hidden", dismiss: true },
		});

		expect(container.querySelector('[data-callout="warning"]')).toBeNull();
		expect(container.textContent).not.toContain("hidden");
	});

	it("dismisses the callout on click", async () => {
		const { container } = render(WarningMessage, {
			props: { message: "careful now" },
		});

		const closeButton = container.querySelector(
			".close-button",
		) as HTMLElement;
		await fireEvent.click(closeButton);
		await tick();

		expect(container.querySelector('[data-callout="warning"]')).toBeNull();
	});

	it("dismisses the callout on keypress", async () => {
		const { container } = render(WarningMessage, {
			props: { message: "careful now" },
		});

		const closeButton = container.querySelector(
			".close-button",
		) as HTMLElement;
		await fireEvent.keyPress(closeButton, { key: "Enter" });
		await tick();

		expect(container.querySelector('[data-callout="warning"]')).toBeNull();
	});
});
