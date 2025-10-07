/******************************************************************************
 *                                                                             *
 * Creation Date : 06/10/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 ******************************************************************************/

import { db } from "@/src/modules/shared/infrastructure/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { Category } from "../../domain/entities/Category";
import { Farm } from "../../domain/entities/Farm";

/* ============================
 * FARMS
 * ============================ */

/** Cria uma fazenda e retorna o ID gerado. */
export async function addFarm(farm: Omit<Farm, "id">): Promise<string> {
    try {
        const ref = await addDoc(collection(db, "farms"), {
            ...farm,
            lastUpdated: new Date().toISOString(),
        });
        return ref.id;
    } catch (error) {
        console.error("Erro ao adicionar fazenda:", error);
        throw error;
    }
}

/** Lista todas as fazendas. */
export async function getFarms(): Promise<Farm[]> {
    try {
        const qs = await getDocs(collection(db, "farms"));
        return qs.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Farm, "id">),
        }));
    } catch (error) {
        console.error("Erro ao buscar fazendas:", error);
        throw error;
    }
}

/** Atualiza parcialmente uma fazenda. */
export async function updateFarm(id: string, data: Partial<Farm>): Promise<void> {
    try {
        const ref = doc(db, "farms", id);
        await updateDoc(ref, { ...data, lastUpdated: new Date().toISOString() });
    } catch (error) {
        console.error("Erro ao atualizar fazenda:", error);
        throw error;
    }
}

/** Exclui uma fazenda. */
export async function deleteFarm(id: string): Promise<void> {
    try {
        const ref = doc(db, "farms", id);
        await deleteDoc(ref);
    } catch (error) {
        console.error("Erro ao excluir fazenda:", error);
        throw error;
    }
}

/* ============================
 * CATEGORIES
 * ============================ */

/** Cria uma categoria e retorna o ID gerado. */
export async function addCategory(category: Omit<Category, "id">): Promise<string> {
    try {
        const ref = await addDoc(collection(db, "categories"), {
            ...category,
            lastUpdated: new Date().toISOString(),
        });
        return ref.id;
    } catch (error) {
        console.error("Erro ao adicionar categoria:", error);
        throw error;
    }
}

/** Lista todas as categorias. */
export async function getCategories(): Promise<Category[]> {
    try {
        const qs = await getDocs(collection(db, "categories"));
        return qs.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Category, "id">),
        }));
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
    }
}

/** Atualiza parcialmente uma categoria. */
export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
    try {
        const ref = doc(db, "categories", id);
        await updateDoc(ref, { ...data, lastUpdated: new Date().toISOString() });
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        throw error;
    }
}

/** Exclui uma categoria. */
export async function deleteCategory(id: string): Promise<void> {
    try {
        const ref = doc(db, "categories", id);
        await deleteDoc(ref);
    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        throw error;
    }
}
