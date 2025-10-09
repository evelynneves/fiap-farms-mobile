import { Item } from "../../domain/entities/Item";
import { addItemInStorage } from "../../infrastructure/services/itemService";

const norm = (s: string) => s.trim().toLowerCase();

export async function addItem(items: Item[], newItem: Omit<Item, "id" | "status">): Promise<Item[]> {
    const duplicate = items.some((i) => norm(i.name) === norm(newItem.name) && i.farm === newItem.farm);
    if (duplicate) {
        throw new Error("Já existe um item com este nome nesta fazenda");
    }

    const added = await addItemInStorage(newItem);
    return [...items, added];
}
