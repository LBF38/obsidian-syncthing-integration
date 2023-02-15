/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	// workaround because obsidian api does not have transpiled js included in its node module
	// From: https://github.com/kulshekhar/ts-jest/issues/1523
	// forcefully map obsidian to its .d.ts file
	moduleNameMapper: {
		obsidian: "<rootDir>/node_modules/obsidian/obsidian.d.ts",
	},
	// ignore patterns for obsidian or you will get import/export errors within obsidian
	transformIgnorePatterns: ["node_modules/(?!obsidian/.*)"],
};
