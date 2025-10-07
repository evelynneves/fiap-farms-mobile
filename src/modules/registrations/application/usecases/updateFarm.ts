import { Farm } from "../../domain/entities/Farm";
import { updateFarm as updateFarmInStorage } from "../../infrastructure/services/storageService";

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Atualiza uma fazenda garantindo que não crie duplicado por nome.
 */
export async function updateFarm(farms: Farm[], updated: Farm): Promise<Farm[]> {
    const duplicate = farms.some((f) => f.id !== updated.id && norm(f.name) === norm(updated.name));
    if (duplicate) {
        throw new Error("Já existe uma fazenda com este nome");
    }

    await updateFarmInStorage(updated.id, { ...updated, name: updated.name.trim() });
    return farms.map((f) => (f.id === updated.id ? { ...updated, name: updated.name.trim() } : f));
}
