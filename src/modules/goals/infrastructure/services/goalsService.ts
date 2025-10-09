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
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { Goal } from "../../domain/entities/Goal";

const getGoalsCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    return collection(db, `users/${user.uid}/goals`);
};

export async function fetchGoals(): Promise<Goal[]> {
    const q = query(getGoalsCollection(), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<Goal, "id">;

        return {
            id: docSnap.id,
            ...data,
            startDate: data.startDate ?? new Date().toISOString(),
            deadline: data.deadline ?? null,
        } as Goal;
    });
}

export async function createGoal(goal: Omit<Goal, "id">): Promise<void> {
    const col = getGoalsCollection();
    const ref = doc(col);
    const now = new Date().toISOString();

    await setDoc(ref, {
        ...goal,
        id: ref.id,
        status: goal.status ?? "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        startDate: goal.startDate ?? now,
        deadline: goal.deadline ?? null,
    });
}

export async function updateGoalFirestore(goal: Goal): Promise<void> {
    if (!goal.id) throw new Error("ID da meta não informado");

    const ref = doc(getGoalsCollection(), goal.id);

    await updateDoc(ref, {
        ...goal,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteGoalFirestore(id: string): Promise<void> {
    if (!id) throw new Error("ID da meta não informado");

    const ref = doc(getGoalsCollection(), id);
    await deleteDoc(ref);
}
