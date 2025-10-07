import { Category } from "../../domain/entities/Category";
import { addCategory as addCategoryToStorage } from "../../infrastructure/services/storageService";

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Adiciona uma categoria garantindo unicidade por nome (case-insensitive).
 * O service retorna o ID gerado no Firestore.
 */
export async function addCategory(categories: Category[], newCategory: Omit<Category, "id">): Promise<Category[]> {
    const duplicate = categories.some((c) => norm(c.name) === norm(newCategory.name));
    if (duplicate) {
        throw new Error("Já existe uma categoria com este nome");
    }

    const id = await addCategoryToStorage({
        ...newCategory,
        name: newCategory.name.trim(),
    });

    const categoryWithId: Category = { ...newCategory, id, name: newCategory.name.trim() };
    return [...categories, categoryWithId];
}
