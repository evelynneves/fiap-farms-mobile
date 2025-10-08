/******************************************************************************
 *                                                                             *
 * Creation Date : 06/10/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 ******************************************************************************/

import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../infrastructure/firebase";
import { auth } from "../../infrastructure/firebase/firebaseConfig";
import { Goal } from "../domain/entities/Goal";
import { Item } from "../domain/entities/Item";
import { Sale } from "../domain/entities/Sale";

/**
 * Retorna a subcoleção de metas do usuário autenticado.
 */
const getGoalsCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    return collection(db, `users/${user.uid}/goals`);
};

/**
 * Busca todos os itens do usuário autenticado.
 */
export async function getItemsFromStorage(): Promise<Item[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const qs = await getDocs(collection(db, `users/${user.uid}/items`));
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Item, "id">;
        return { id: d.id, ...data };
    });
}

/**
 * Busca todas as vendas do usuário autenticado.
 */
export async function getSalesFromStorage(): Promise<Sale[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const qs = await getDocs(collection(db, `users/${user.uid}/sales`));
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Sale, "id">;
        return {
            id: d.id,
            ...data,
            totalValue: data.quantity * data.salePrice,
        };
    });
}

/**
 * Busca todas as metas do usuário autenticado.
 */
export async function getGoalsFromStorage(): Promise<Goal[]> {
    const qs = await getDocs(getGoalsCollection());
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Goal, "id">;
        return { id: d.id, ...data };
    });
}

/**
 * Atualiza uma meta existente em /users/{uid}/goals/{goalId}.
 */
export async function updateGoalFirestore(goal: Goal): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    if (!goal.id) throw new Error("ID da meta ausente.");

    const ref = doc(db, `users/${user.uid}/goals/${goal.id}`);
    await updateDoc(ref, { ...goal, updatedAt: new Date().toISOString() });
}
