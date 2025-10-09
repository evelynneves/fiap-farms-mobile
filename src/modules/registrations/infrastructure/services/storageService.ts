import { db } from "@/src/modules/shared/infrastructure/firebase";
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { Category } from "../../domain/entities/Category";
import { Farm } from "../../domain/entities/Farm";

function getUserCollectionPath(path: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    return `users/${user.uid}/${path}`;
}

export async function addFarm(farm: Omit<Farm, "id">): Promise<Farm> {
    const colRef = collection(db, getUserCollectionPath("farms"));
    const ref = doc(colRef);
    const now = new Date().toISOString();

    const payload = {
        ...farm,
        id: ref.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdAtISO: now,
    };

    await setDoc(ref, payload);

    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await new Promise((r) => setTimeout(r, 300));
        const retrySnap = await getDoc(ref);
        if (!retrySnap.exists()) throw new Error("Falha ao obter fazenda criada.");
        return { id: retrySnap.id, ...(retrySnap.data() as Omit<Farm, "id">) };
    }

    return { id: snap.id, ...(snap.data() as Omit<Farm, "id">) };
}

export async function getFarms(): Promise<Farm[]> {
    const colRef = collection(db, getUserCollectionPath("farms"));
    const q = query(colRef, orderBy("createdAt", "desc"));
    const qs = await getDocs(q);
    return qs.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Farm, "id">),
    }));
}

export async function updateFarm(id: string, data: Partial<Farm>) {
    const ref = doc(db, getUserCollectionPath(`farms/${id}`));
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteFarm(id: string) {
    const ref = doc(db, getUserCollectionPath(`farms/${id}`));
    await deleteDoc(ref);
}

export async function addCategory(category: Omit<Category, "id">): Promise<Category> {
    const colRef = collection(db, getUserCollectionPath("categories"));
    const ref = doc(colRef);
    const payload = {
        ...category,
        id: ref.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
    return { ...category, id: ref.id };
}

export async function getCategories(): Promise<Category[]> {
    const colRef = collection(db, getUserCollectionPath("categories"));
    const q = query(colRef, orderBy("createdAt", "desc"));
    const qs = await getDocs(q);
    return qs.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Category, "id">),
    }));
}

export async function updateCategory(id: string, data: Partial<Category>) {
    const ref = doc(db, getUserCollectionPath(`categories/${id}`));
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCategory(id: string) {
    const ref = doc(db, getUserCollectionPath(`categories/${id}`));
    await deleteDoc(ref);
}
