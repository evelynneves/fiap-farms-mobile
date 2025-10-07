import { Farm } from "../../domain/entities/Farm";
import { getFarms as getFarmsFromStorage } from "../../infrastructure/services/storageService";

/**
 * Lista fazendas do Firestore.
 */
export async function getFarms(): Promise<Farm[]> {
    return await getFarmsFromStorage();
}
