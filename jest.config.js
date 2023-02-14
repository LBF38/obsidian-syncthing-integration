/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>"],
	modulePaths: ["<rootDir>"],
	// moduleNameMapper: {
	// 	obsidian: "<rootDir>/node_modules/obsidian",
	// },
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
};
