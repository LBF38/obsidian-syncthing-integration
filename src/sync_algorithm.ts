import { TFile } from "obsidian";

enum syncChoice {
	upload,
	download,
	ignore,
}

interface syncFile {
	localToRemote: syncChoice.upload | syncChoice.ignore;
	remoteToLocal: syncChoice.download | syncChoice.ignore;
}

export class syncAlgorithm {
	localFile: string;
	remoteFile: string;
	syncFiles: syncFile;

	compareFiles(localFile: TFile, remoteFile: TFile): syncFile {
		if (localFile.stat.mtime > remoteFile.stat.mtime) {
			this.syncFiles.localToRemote = syncChoice.upload;
			this.syncFiles.remoteToLocal = syncChoice.ignore;
			return this.syncFiles;
		}
		this.syncFiles.localToRemote = syncChoice.ignore;
		this.syncFiles.remoteToLocal = syncChoice.download;
		return this.syncFiles;
	}
}
