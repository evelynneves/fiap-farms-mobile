import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../infrastructure/firebase";
import { auth } from "../../infrastructure/firebase/firebaseConfig";
import { Goal } from "../domain/entities/Goal";
import { Item } from "../domain/entities/Item";
import { Sale } from "../domain/entities/Sale";

const getGoalsCollection = () => {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    return collection(db, "users", auth.currentUser.uid, "goals");
};

export async function getItemsFromStorage(): Promise<Item[]> {
    const qs = await getDocs(collection(db, "items"));
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Item, "id">;
        return {
            id: d.id,
            ...data,
        };
    });
}

export async function getSalesFromStorage(): Promise<Sale[]> {
    const qs = await getDocs(collection(db, "sales"));
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Sale, "id">;
        return {
            id: d.id,
            ...data,
            totalValue: data.quantity * data.salePrice,
        };
    });
}

export async function getGoalsFromStorage(): Promise<Goal[]> {
    const qs = await getDocs(getGoalsCollection());
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Goal, "id">;
        return {
            id: d.id,
            ...data,
        };
    });
}

export async function updateGoalFirestore(goal: Goal): Promise<void> {
    const ref = doc(getGoalsCollection(), goal.id);
    await updateDoc(ref, { ...goal });
}
