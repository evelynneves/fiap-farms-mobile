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
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { Category } from "../../domain/entities/Category";
import { Farm } from "../../domain/entities/Farm";

export async function addFarm(farm: Omit<Farm, "id">): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const colRef = collection(db, `users/${user.uid}/farms`);
        const ref = await addDoc(colRef, {
            ...farm,
            lastUpdated: new Date().toISOString(),
        });
        return ref.id;
    } catch (error) {
        console.error("Erro ao adicionar fazenda:", error);
        throw error;
    }
}

export async function getFarms(): Promise<Farm[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const qs = await getDocs(collection(db, `users/${user.uid}/farms`));
        return qs.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Farm, "id">),
        }));
    } catch (error) {
        console.error("Erro ao buscar fazendas:", error);
        throw error;
    }
}

export async function updateFarm(id: string, data: Partial<Farm>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const ref = doc(db, `users/${user.uid}/farms/${id}`);
        await updateDoc(ref, { ...data, lastUpdated: new Date().toISOString() });
    } catch (error) {
        console.error("Erro ao atualizar fazenda:", error);
        throw error;
    }
}

export async function deleteFarm(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const ref = doc(db, `users/${user.uid}/farms/${id}`);
        await deleteDoc(ref);
    } catch (error) {
        console.error("Erro ao excluir fazenda:", error);
        throw error;
    }
}

export async function addCategory(category: Omit<Category, "id">): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const colRef = collection(db, `users/${user.uid}/categories`);
        const ref = await addDoc(colRef, {
            ...category,
            lastUpdated: new Date().toISOString(),
        });
        return ref.id;
    } catch (error) {
        console.error("Erro ao adicionar categoria:", error);
        throw error;
    }
}

export async function getCategories(): Promise<Category[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const qs = await getDocs(collection(db, `users/${user.uid}/categories`));
        return qs.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Category, "id">),
        }));
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
    }
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const ref = doc(db, `users/${user.uid}/categories/${id}`);
        await updateDoc(ref, { ...data, lastUpdated: new Date().toISOString() });
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        throw error;
    }
}

export async function deleteCategory(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        const ref = doc(db, `users/${user.uid}/categories/${id}`);
        await deleteDoc(ref);
    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        throw error;
    }
}
