import { fileURLToPath } from "node:url";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string): string =>
	fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
	plugins: [
		// Svelte support is only needed by the component tests, but having the
		// plugin loaded globally keeps a single Vitest configuration.
		svelte({
			preprocess: vitePreprocess(),
			compilerOptions: { dev: true },
		}),
	],
	resolve: {
		alias: [
			// The real `obsidian` package only ships types, so the runtime is
			// replaced by a hand-written mock.
			{ find: /^obsidian$/, replacement: fromRoot("test/mocks/obsidian.ts") },
			// Source files use non-relative `src/...` imports (baseUrl: ".").
			{ find: /^src\//, replacement: fromRoot("src/") },
		],
	},
	test: {
		include: ["src/**/*.test.ts", "test/**/*.test.ts"],
		setupFiles: [fromRoot("test/setup.ts")],
		environment: "node",
		clearMocks: true,
		restoreMocks: false,
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			include: ["src/**/*.{ts,svelte}"],
			exclude: [
				"src/**/*.test.ts",
				"src/globals.d.ts",
				"src/reset.d.ts",
				// The plugin entry point wires the whole app together; it is
				// exercised indirectly but not covered by unit tests.
				"src/main.ts",
				"src/views/logos.ts",
				"src/styles/**",
			],
		},
	},
});
