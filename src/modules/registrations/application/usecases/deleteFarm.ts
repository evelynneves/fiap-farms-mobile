import { Farm } from "../../domain/entities/Farm";
import { deleteFarm as deleteFarmFromStorage } from "../../infrastructure/services/storageService";

/**
 * Exclui uma fazenda e devolve a lista atualizada.
 */
export async function deleteFarm(farms: Farm[], id: string): Promise<Farm[]> {
    await deleteFarmFromStorage(id);
    return farms.filter((f) => f.id !== id);
}
