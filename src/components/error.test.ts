// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { Failure } from "src/models/failures";
import ErrorComponent from "./error.svelte";

afterEach(cleanup);

describe("error.svelte", () => {
	it("renders a Failure message", () => {
		const { container } = render(ErrorComponent, {
			props: { failure: new Failure("boom") },
		});

		expect(container.textContent).toContain("A failure occured");
		expect(container.textContent).toContain("boom");
	});

	it("renders any object exposing a message", () => {
		const { container } = render(ErrorComponent, {
			props: { failure: { message: "plain message" } },
		});

		expect(container.textContent).toContain("plain message");
	});
});
