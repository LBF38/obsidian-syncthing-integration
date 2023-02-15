import { syncAlgorithm, syncChoice } from "../src/sync_algorithm";
import { TFile } from "obsidian";

jest.mock("obsidian", () => {
	return {
		TFile: jest.fn().mockImplementation(() => {
			return {
				stat: {
					mtime: 0,
				},
			};
		}),
	};
});

describe("Sync algorithm", () => {
	beforeEach(() => {});
	it("should return localToRemote when the local file is newer than the remote file.", () => {
		// arrange
		const localFile: TFile = new TFile();
		const remoteFile: TFile = new TFile();
		localFile.stat.mtime = 100;
		remoteFile.stat.mtime = 50;
		const sync_algorithm = new syncAlgorithm();

		// act
		const choice = sync_algorithm.compareFiles(localFile, remoteFile);

		// assert
		expect(choice.localToRemote).toBe(syncChoice.upload);
		expect(choice.remoteToLocal).toBe(syncChoice.ignore);
	});
});
