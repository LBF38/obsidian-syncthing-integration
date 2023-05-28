import { SyncThingRepository } from "../repositories/syncthing_repository";

function GetConfiguration(repository: SyncThingRepository) {
	return repository.getConfiguration();
}

function GetAPIKey(repository: SyncThingRepository) {
	return repository.getAPIKey();
}

export { GetConfiguration, GetAPIKey };
