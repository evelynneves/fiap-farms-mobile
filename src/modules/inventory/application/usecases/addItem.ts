import { Item } from "../../domain/entities/Item";
import { addItemInStorage } from "../../infrastructure/services/itemService";

// Normaliza nome para comparação (sem espaços extras e case-insensitive)
const norm = (s: string) => s.trim().toLowerCase();

/**
 * Adiciona um item garantindo que não exista duplicado por (nome + fazenda).
 * O service calcula o status e gera o ID no Firestore.
 */
export async function addItem(items: Item[], newItem: Omit<Item, "id" | "status">): Promise<Item[]> {
    const duplicate = items.some((i) => norm(i.name) === norm(newItem.name) && i.farm === newItem.farm);
    if (duplicate) {
        throw new Error("Já existe um item com este nome nesta fazenda");
    }

    const added = await addItemInStorage(newItem);
    return [...items, added];
}
