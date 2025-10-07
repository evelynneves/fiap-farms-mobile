import { Item } from "../../domain/entities/Item";
import { deleteItemFromStorage } from "../../infrastructure/services/itemService";

/**
 * Remove um item no Firestore e devolve a lista atualizada.
 */
export async function deleteItem(items: Item[], id: string): Promise<Item[]> {
    await deleteItemFromStorage(id);
    return items.filter((i) => i.id !== id);
}
