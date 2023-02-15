import { TFile } from "obsidian";
import { createHash } from "crypto";

export enum syncChoice {
	upload,
	download,
	ignore,
	delete,
}

export interface syncFile {
	localToRemote: syncChoice.upload | syncChoice.ignore;
	remoteToLocal: syncChoice.download | syncChoice.ignore;
}

export interface fileChoice {
	localFileChoice: syncChoice.upload | syncChoice.ignore | syncChoice.delete;
	remoteFileChoice:
		| syncChoice.download
		| syncChoice.ignore
		| syncChoice.delete;
}

export class syncAlgorithm {
	localFile: string;
	remoteFile: string;
	syncFiles: syncFile = {
		localToRemote: syncChoice.ignore,
		remoteToLocal: syncChoice.ignore,
	};

	compareFile(localVersion: TFile, remoteVersion: TFile): fileChoice {
		const fileChoice: fileChoice = {
			localFileChoice: syncChoice.ignore,
			remoteFileChoice: syncChoice.ignore,
		};

		if (localVersion.stat.mtime > remoteVersion.stat.mtime) {
			fileChoice.localFileChoice = syncChoice.upload;
			fileChoice.remoteFileChoice = syncChoice.ignore;
			return fileChoice;
		} else if (localVersion.stat.mtime < remoteVersion.stat.mtime) {
			fileChoice.localFileChoice = syncChoice.ignore;
			fileChoice.remoteFileChoice = syncChoice.download;
			return fileChoice;
		}
		return fileChoice;
	}

	isSameContent(
		localFileContent: string,
		remoteFileContent: string,
		hashAlgorithm: "sha1" | "sha256" = "sha1"
	): boolean {
		const localHash = createHash(hashAlgorithm)
			.update(localFileContent)
			.digest("hex");
		const remoteHash = createHash(hashAlgorithm)
			.update(remoteFileContent)
			.digest("hex");
		return localHash === remoteHash;
	}
}
