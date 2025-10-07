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
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { Item } from "../../domain/entities/Item";
import { getStockStatus } from "../../utils/getStockStatus";

/**
 * Adiciona um novo item no Firestore.
 * Calcula o status de estoque e adiciona metadados de atualização.
 *
 * @param data Dados do item (sem o campo id)
 * @returns O item criado com o ID gerado pelo Firestore
 */
export async function addItemInStorage(data: Omit<Item, "id">): Promise<Item> {
    try {
        const docRef = await addDoc(collection(db, "items"), {
            ...data,
            status: getStockStatus(data).status,
            lastUpdated: new Date().toISOString(),
        });

        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Erro ao adicionar item no Firestore:", error);
        throw error;
    }
}

/**
 * Atualiza um item existente no Firestore.
 * Recalcula o status de estoque e retorna os dados atualizados.
 *
 * @param data Dados completos do item (com id)
 * @returns O item atualizado
 */
export async function updateItemInStorage(data: Item): Promise<Item> {
    if (!data.id) throw new Error("ID inválido para atualização.");

    try {
        const ref = doc(db, "items", data.id);
        await updateDoc(ref, {
            ...data,
            status: getStockStatus(data).status,
            lastUpdated: new Date().toISOString(),
        });

        const snap = await getDoc(ref);
        return { id: snap.id, ...(snap.data() as Omit<Item, "id">) };
    } catch (error) {
        console.error("Erro ao atualizar item:", error);
        throw error;
    }
}

/**
 * Remove um item do Firestore.
 *
 * @param id ID do item a ser deletado
 */
export async function deleteItemFromStorage(id: string): Promise<void> {
    try {
        const ref = doc(db, "items", id);
        await deleteDoc(ref);
    } catch (error) {
        console.error("Erro ao excluir item:", error);
        throw error;
    }
}
