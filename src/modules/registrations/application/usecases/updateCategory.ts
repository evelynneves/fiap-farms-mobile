import { Category } from "../../domain/entities/Category";
import { updateCategory as updateCategoryInStorage } from "../../infrastructure/services/storageService";

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Atualiza uma categoria garantindo que não crie duplicado por nome.
 */
export async function updateCategory(categories: Category[], updated: Category): Promise<Category[]> {
    const duplicate = categories.some((c) => c.id !== updated.id && norm(c.name) === norm(updated.name));
    if (duplicate) {
        throw new Error("Já existe uma categoria com este nome");
    }

    await updateCategoryInStorage(updated.id, { ...updated, name: updated.name.trim() });
    return categories.map((c) => (c.id === updated.id ? { ...updated, name: updated.name.trim() } : c));
}
