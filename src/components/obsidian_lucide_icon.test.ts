// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { tick } from "svelte";
import { getIcon } from "obsidian";
import ObsidianLucideIcon from "./obsidian_lucide_icon.svelte";

const mockGetIcon = vi.mocked(getIcon);

afterEach(cleanup);

describe("obsidian_lucide_icon.svelte", () => {
	it("appends the icon returned by getIcon", async () => {
		const icon = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg",
		);
		icon.setAttribute("data-testid", "lucide-icon");
		mockGetIcon.mockReturnValue(icon);

		const { container } = render(ObsidianLucideIcon, {
			props: { name: "star" },
		});
		await tick();

		expect(mockGetIcon).toHaveBeenCalledWith("star");
		expect(
			container.querySelector('svg[data-testid="lucide-icon"]'),
		).not.toBeNull();
	});

	it("renders an empty container when the icon does not exist", async () => {
		mockGetIcon.mockReturnValue(null);

		const { container } = render(ObsidianLucideIcon, {
			props: { name: "missing" },
		});
		await tick();

		expect(container.querySelector("div")).not.toBeNull();
		expect(container.querySelector("svg")).toBeNull();
	});

	it("forwards extra props to the container", async () => {
		mockGetIcon.mockReturnValue(null);

		const { container } = render(ObsidianLucideIcon, {
			props: { name: "star", class: "my-icon" } as never,
		});
		await tick();

		expect(container.querySelector(".my-icon")).not.toBeNull();
	});
});
