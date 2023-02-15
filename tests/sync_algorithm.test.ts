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
	let localFile: TFile;
	let remoteFile: TFile;
	let sync_algorithm: syncAlgorithm;

	beforeEach(() => {
		localFile = new TFile();
		remoteFile = new TFile();
		sync_algorithm = new syncAlgorithm();
	});

	it("should return upload/ignore when the local file is newer than the remote file.", () => {
		// arrange
		localFile.stat.mtime = 100;
		remoteFile.stat.mtime = 50;

		// act
		const choice = sync_algorithm.compareFile(localFile, remoteFile);

		// assert
		expect(choice.localFileChoice).toBe(syncChoice.upload);
		expect(choice.remoteFileChoice).toBe(syncChoice.ignore);
	});

	it("should return ignore/download when the local file is newer than the remote file.", () => {
		// arrange
		localFile.stat.mtime = 50;
		remoteFile.stat.mtime = 100;

		// act
		const choice = sync_algorithm.compareFile(localFile, remoteFile);

		// assert
		expect(choice.localFileChoice).toBe(syncChoice.ignore);
		expect(choice.remoteFileChoice).toBe(syncChoice.download);
	});

	it("should return ignore/ignore when the local file is the same age as the remote file.", () => {
		// arrange
		localFile.stat.mtime = 100;
		remoteFile.stat.mtime = 100;

		// act
		const choice = sync_algorithm.compareFile(localFile, remoteFile);

		// assert
		expect(choice.localFileChoice).toBe(syncChoice.ignore);
		expect(choice.remoteFileChoice).toBe(syncChoice.ignore);
	});

	it("should return True as the content of the files is the same.", () => {
		// Arrange
		const localFileContent = "This is a test file";
		const remoteFileContent = "This is a test file";
		// Act
		const isSameContent = sync_algorithm.isSameContent(
			localFileContent,
			remoteFileContent
		);
		// Assert
		expect(isSameContent).toBe(true);
	});

	it("should return False as the content of the files is different.", () => {
		// Arrange
		const localFileContent = "This is a test file";
		const remoteFileContent = "This is a different test file";
		// Act
		const isSameContent = sync_algorithm.isSameContent(
			localFileContent,
			remoteFileContent
		);
		// Assert
		expect(isSameContent).toBe(false);
	});
});
