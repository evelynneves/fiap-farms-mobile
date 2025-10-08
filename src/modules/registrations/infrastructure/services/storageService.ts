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

function requireUser() {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    return user;
}

/** =================== FARMS =================== */

export async function addFarm(farm: Omit<Farm, "id">): Promise<string> {
    const user = requireUser();
    const colRef = collection(db, `users/${user.uid}/farms`);
    const ref = await addDoc(colRef, {
        ...farm,
        lastUpdated: new Date().toISOString(),
    });
    return ref.id;
}

export async function getFarms(): Promise<Farm[]> {
    const user = requireUser();
    const qs = await getDocs(collection(db, `users/${user.uid}/farms`));
    return qs.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Farm, "id">),
    }));
}

export async function updateFarm(id: string, data: Partial<Farm>): Promise<void> {
    const user = requireUser();
    if (!id) throw new Error("ID da fazenda inválido.");
    const ref = doc(db, `users/${user.uid}/farms/${id}`);
    await updateDoc(ref, { ...data, lastUpdated: new Date().toISOString() });
}

export async function deleteFarm(id: string): Promise<void> {
    const user = requireUser();
    if (!id) throw new Error("ID da fazenda inválido.");
    const ref = doc(db, `users/${user.uid}/farms/${id}`);
    await deleteDoc(ref);
}

/** =================== CATEGORIES =================== */

export async function addCategory(category: Omit<Category, "id">): Promise<string> {
    const user = requireUser();
    const colRef = collection(db, `users/${user.uid}/categories`);
    const ref = await addDoc(colRef, {
        ...category,
        lastUpdated: new Date().toISOString(),
    });
    return ref.id;
}

export async function getCategories(): Promise<Category[]> {
    const user = requireUser();
    const qs = await getDocs(collection(db, `users/${user.uid}/categories`));
    return qs.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Category, "id">),
    }));
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
    const user = requireUser();
    if (!id) throw new Error("ID da categoria inválido.");
    const ref = doc(db, `users/${user.uid}/categories/${id}`);
    await updateDoc(ref, { ...data, lastUpdated: new Date().toISOString() });
}

export async function deleteCategory(id: string): Promise<void> {
    const user = requireUser();
    if (!id) throw new Error("ID da categoria inválido.");
    const ref = doc(db, `users/${user.uid}/categories/${id}`);
    await deleteDoc(ref);
}
