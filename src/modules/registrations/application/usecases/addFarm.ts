import { Farm } from "../../domain/entities/Farm";
import { addFarm as addFarmToStorage } from "../../infrastructure/services/storageService";

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Adiciona uma fazenda garantindo unicidade por nome (case-insensitive).
 * O service retorna o ID gerado no Firestore.
 */
export async function addFarm(farms: Farm[], newFarm: Omit<Farm, "id">): Promise<Farm[]> {
    const duplicate = farms.some((f) => norm(f.name) === norm(newFarm.name));
    if (duplicate) {
        throw new Error("Já existe uma fazenda com este nome");
    }

    const id = await addFarmToStorage({
        ...newFarm,
        name: newFarm.name.trim(),
    });

    const farmWithId: Farm = { ...newFarm, id, name: newFarm.name.trim() };
    return [...farms, farmWithId];
}
