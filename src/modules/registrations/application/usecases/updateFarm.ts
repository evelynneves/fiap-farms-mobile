import { Farm } from "../../domain/entities/Farm";
import { updateFarm as updateFarmInStorage } from "../../infrastructure/services/storageService";

export async function updateFarm(farms: Farm[], updated: Farm) {
    const duplicate = farms.some((f) => f.id !== updated.id && f.name.toLowerCase() === updated.name.toLowerCase());
    if (duplicate) throw new Error("Já existe uma fazenda com este nome");

    await updateFarmInStorage(updated.id, updated);
    return farms.map((f) => (f.id === updated.id ? updated : f));
}
