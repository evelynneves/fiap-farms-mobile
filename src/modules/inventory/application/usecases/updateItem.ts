import { Item } from "../../domain/entities/Item";
import { updateItemInStorage } from "../../infrastructure/services/itemService";

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Atualiza dados do item garantindo que não crie duplicado por (nome + fazenda).
 * O service recalcula o status e retorna o registro persistido.
 */
export async function updateItem(items: Item[], updated: Item): Promise<Item[]> {
    const duplicate = items.some(
        (i) => i.id !== updated.id && norm(i.name) === norm(updated.name) && i.farm === updated.farm
    );
    if (duplicate) {
        throw new Error("Já existe um item com este nome nesta fazenda");
    }

    const persisted = await updateItemInStorage(updated);
    return items.map((i) => (i.id === updated.id ? persisted : i));
}
