/******************************************************************************
 *                                                                             *
 * Creation Date : 06/10/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 ******************************************************************************/

import { getStockStatus } from "@/src/modules/shared/goal";
import { db } from "@/src/modules/shared/infrastructure/firebase";
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Item } from "../../domain/entities/Item";

export async function addItemInStorage(data: Omit<Item, "id">): Promise<Item> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const colRef = collection(db, `users/${user.uid}/items`);
        const status = getStockStatus(data).status;

        const docRef = await addDoc(colRef, {
            ...data,
            status,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            await new Promise((r) => setTimeout(r, 300));
            const retrySnap = await getDoc(docRef);
            if (!retrySnap.exists()) throw new Error("Falha ao obter item criado.");
            return { id: retrySnap.id, ...(retrySnap.data() as Omit<Item, "id">) };
        }

        return { id: snap.id, ...(snap.data() as Omit<Item, "id">) };
    } catch (error) {
        console.error("Erro ao adicionar item no Firestore:", error);
        throw error;
    }
}

export async function updateItemInStorage(data: Item): Promise<Item> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    if (!data.id) throw new Error("ID inválido para atualização.");

    try {
        const ref = doc(db, `users/${user.uid}/items/${data.id}`);
        const status = getStockStatus(data).status;

        await setDoc(
            ref,
            {
                ...data,
                status,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("Item não encontrado após atualização.");

        return { id: snap.id, ...(snap.data() as Omit<Item, "id">) };
    } catch (error) {
        console.error("Erro ao atualizar item no Firestore:", error);
        throw error;
    }
}

export async function deleteItemFromStorage(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    if (!id) throw new Error("ID do item ausente.");

    try {
        const ref = doc(db, `users/${user.uid}/items/${id}`);
        await deleteDoc(ref);
    } catch (error) {
        console.error("Erro ao excluir item:", error);
        throw error;
    }
}
