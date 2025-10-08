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
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { Goal } from "../../domain/entities/Goal";

/**
 * Obtém a subcoleção de metas do usuário autenticado.
 */
const getGoalsCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    return collection(db, "users", user.uid, "goals");
};

/**
 * Busca todas as metas do usuário autenticado.
 */
export async function fetchGoals(): Promise<Goal[]> {
    const snapshot = await getDocs(getGoalsCollection());
    return snapshot.docs.map(
        (docSnap) =>
            ({
                id: docSnap.id,
                ...docSnap.data(),
            } as Goal)
    );
}

/**
 * Cria uma nova meta no Firestore.
 */
export async function createGoal(input: Omit<Goal, "id">): Promise<Goal> {
    const col = getGoalsCollection();
    const ref = doc(col);
    const saved: Goal = { id: ref.id, ...input };
    await setDoc(ref, saved);
    return saved;
}

/**
 * Atualiza uma meta existente.
 */
export async function updateGoalFirestore(goal: Goal): Promise<void> {
    if (!goal.id) throw new Error("ID da meta ausente");
    const ref = doc(getGoalsCollection(), goal.id);
    await updateDoc(ref, {
        ...goal,
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Exclui uma meta do Firestore.
 */
export async function deleteGoalFirestore(id: string): Promise<void> {
    const ref = doc(getGoalsCollection(), id);
    await deleteDoc(ref);
}
