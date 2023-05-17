import { SyncThingRepository } from "../repositories/syncthing_repository";

function GetConfiguration(repository: SyncThingRepository) {
	return repository.getConfiguration();
}

export { GetConfiguration };
