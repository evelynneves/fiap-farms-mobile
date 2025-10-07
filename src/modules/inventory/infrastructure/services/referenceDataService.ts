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
import { collection, getDocs } from "firebase/firestore";

type RefItem = { id: string; name: string };

/** Utilitário para mapear documentos Firestore { name } */
const mapRefItem = (d: any): RefItem => ({
    id: d.id,
    ...(d.data() as { name: string }),
});

/** CATEGORIES */
export async function getCategoriesFromStorage(): Promise<RefItem[]> {
    const qs = await getDocs(collection(db, "categories"));
    return qs.docs.map(mapRefItem);
}

/** FARMS */
export async function getFarmsFromStorage(): Promise<RefItem[]> {
    const qs = await getDocs(collection(db, "farms"));
    return qs.docs.map(mapRefItem);
}
