import { Category } from "../../domain/entities/Category";
import { updateCategory as updateCategoryInStorage } from "../../infrastructure/services/storageService";

export async function updateCategory(categories: Category[], updated: Category) {
    const duplicate = categories.some(
        (c) => c.id !== updated.id && c.name.toLowerCase() === updated.name.toLowerCase()
    );
    if (duplicate) throw new Error("Já existe uma categoria com este nome");

    await updateCategoryInStorage(updated.id, updated);
    return categories.map((c) => (c.id === updated.id ? updated : c));
}
