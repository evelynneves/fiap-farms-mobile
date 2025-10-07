import { Category } from "../../domain/entities/Category";
import { getCategories as getCategoriesFromStorage } from "../../infrastructure/services/storageService";

/**
 * Lista categorias do Firestore.
 */
export async function listCategory(): Promise<Category[]> {
    return await getCategoriesFromStorage();
}
