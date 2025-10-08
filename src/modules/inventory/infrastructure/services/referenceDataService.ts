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
import { collection, getDocs, onSnapshot } from "firebase/firestore";

type RefItem = { id: string; name: string };

const mapRefItem = (d: any): RefItem => ({ id: d.id, ...(d.data() as { name: string }) });

export async function getCategoriesFromStorage(): Promise<RefItem[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    const qs = await getDocs(collection(db, `users/${user.uid}/categories`));
    return qs.docs.map(mapRefItem);
}

export async function getFarmsFromStorage(): Promise<RefItem[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    const qs = await getDocs(collection(db, `users/${user.uid}/farms`));
    return qs.docs.map(mapRefItem);
}

export function subscribeCategories(cb: (cats: RefItem[]) => void) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    const col = collection(db, `users/${user.uid}/categories`);
    return onSnapshot(col, (snap) => cb(snap.docs.map(mapRefItem)));
}

export function subscribeFarms(cb: (farms: RefItem[]) => void) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    const col = collection(db, `users/${user.uid}/farms`);
    return onSnapshot(col, (snap) => cb(snap.docs.map(mapRefItem)));
}
