import { db } from "@/src/modules/shared/infrastructure/firebase";
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Item } from "../../domain/entities/Item";
import { getStockStatus } from "../../utils/getStockStatus";

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
            lastUpdated: serverTimestamp(),
        });

        return { id: docRef.id, ...data, status };
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

        await updateDoc(ref, {
            ...data,
            status,
            lastUpdated: serverTimestamp(),
        });

        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("Item não encontrado após atualização.");

        return { id: snap.id, ...(snap.data() as Omit<Item, "id">) };
    } catch (error) {
        console.error("Erro ao atualizar item:", error);
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
