import { Category } from "../../domain/entities/Category";
import { deleteCategory as deleteCategoryFromStorage } from "../../infrastructure/services/storageService";

/**
 * Exclui uma categoria e devolve a lista atualizada.
 */
export async function deleteCategory(categories: Category[], id: string): Promise<Category[]> {
    await deleteCategoryFromStorage(id);
    return categories.filter((c) => c.id !== id);
}
