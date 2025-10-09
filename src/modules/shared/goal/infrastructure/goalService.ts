import { UserNotification } from "@/src/modules/settings/infrastructure/services/userNotificationsService";
import { db } from "@/src/modules/shared/infrastructure/firebase";
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { recalculateGoalsProgress } from "../application/usecases/recalculateGoalsProgress";
import { Goal } from "../domain/entities/Goal";
import { Item } from "../domain/entities/Item";
import { Sale } from "../domain/entities/Sale";
import { getStockStatus } from "../utils/getStockStatus";

export type Notification = {
    id?: string;
    type: "success" | "warning" | "info";
    category: "stock" | "goals" | "production";
    title: string;
    message: string;
    timestamp?: any;
    read?: boolean;
};

const getGoalsCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    return collection(db, `users/${user.uid}/goals`);
};

let productionTimeout: ReturnType<typeof setTimeout> | null = null;

export async function getItemsFromStorage(): Promise<Item[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const q = query(collection(db, `users/${user.uid}/items`), orderBy("createdAt", "desc"));
    const qs = await getDocs(q);
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Item, "id">;
        return { id: d.id, ...data };
    });
}

export async function getSalesFromStorage(): Promise<Sale[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const q = query(collection(db, `users/${user.uid}/sales`), orderBy("createdAt", "desc"));
    const qs = await getDocs(q);

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
        return { id: d.id, ...data };
    });
}

export async function updateGoalFirestore(goal: Goal): Promise<void> {
    if (!goal.id) throw new Error("ID da meta não informado");
    const ref = doc(getGoalsCollection(), goal.id);
    await updateDoc(ref, { ...goal });
}

export async function addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const ref = collection(db, `users/${user.uid}/notifications`);
    await addDoc(ref, {
        ...notification,
        read: false,
        createdAt: new Date(),
        timestamp: serverTimestamp(),
    });
}

export async function getFreshNotificationsConfig() {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const userRef = doc(db, `users/${user.uid}`);
    const snap = await getDoc(userRef);
    const defaultConfig = { stock: true, goals: true, production: true };

    if (!snap.exists()) {
        await setDoc(userRef, { notifications: defaultConfig });
        return defaultConfig;
    }

    return snap.data()?.notifications ?? defaultConfig;
}

export function subscribeSalesAndRecalculateGoals() {
    const user = auth.currentUser;
    if (!user) return () => {};

    const salesRef = collection(db, `users/${user.uid}/sales`);
    let initialized = false;

    const unsubscribe = onSnapshot(salesRef, async () => {
        if (!initialized) {
            initialized = true;
            return;
        }

        const [goals, items, sales] = await Promise.all([
            getGoalsFromStorage(),
            getItemsFromStorage(),
            getSalesFromStorage(),
        ]);

        const prevCompleted = new Set(goals.filter((g) => g.status === "completed").map((g) => g.id));
        const recalculated = await recalculateGoalsProgress(goals, {
            getSales: async () => sales,
            getItems: async () => items,
        });

        const nowCompleted = recalculated.filter((g) => g.status === "completed" && !prevCompleted.has(g.id));
        await Promise.all(recalculated.map((goal) => updateGoalFirestore(goal)));

        if (nowCompleted.length > 0) {
            const config = await getFreshNotificationsConfig();
            if (config.goals) {
                for (const g of nowCompleted) {
                    await addNotification({
                        type: "success",
                        category: "goals",
                        title: "Meta Atingida!",
                        message: `${g.title} foi concluída com sucesso (${g.current}/${g.target} ${g.unit})`,
                    });
                }
            }
        }
    });

    return unsubscribe;
}

export function subscribeProductionAndRecalculateGoals() {
    const user = auth.currentUser;
    if (!user) return () => {};

    const itemsRef = collection(db, `users/${user.uid}/items`);
    let initialized = false;

    const unsubscribe = onSnapshot(itemsRef, async () => {
        if (!initialized) {
            initialized = true;
            return;
        }

        if (productionTimeout) clearTimeout(productionTimeout);
        productionTimeout = setTimeout(async () => {
            const [goals, items, sales] = await Promise.all([
                getGoalsFromStorage(),
                getItemsFromStorage(),
                getSalesFromStorage(),
            ]);

            const prevCompleted = new Set(goals.filter((g) => g.status === "completed").map((g) => g.id));
            const recalculated = await recalculateGoalsProgress(goals, {
                getSales: async () => sales,
                getItems: async () => items,
            });

            const nowCompleted = recalculated.filter((g) => g.status === "completed" && !prevCompleted.has(g.id));
            await Promise.all(recalculated.map((goal) => updateGoalFirestore(goal)));

            if (nowCompleted.length > 0) {
                const config = await getFreshNotificationsConfig();
                if (config.goals) {
                    for (const g of nowCompleted) {
                        await addNotification({
                            type: "success",
                            category: "goals",
                            title: "Meta Atingida!",
                            message: `${g.title} foi concluída com sucesso (${g.current}/${g.target} ${g.unit})`,
                        });
                    }
                }
            }
        }, 500);
    });

    return unsubscribe;
}

export function subscribeLowStockNotifications() {
    const user = auth.currentUser;
    if (!user) return () => {};

    const itemsRef = collection(db, `users/${user.uid}/items`);
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let initialized = false;

    const unsubscribe = onSnapshot(itemsRef, async (snapshot) => {
        if (!initialized) {
            initialized = true;
            return;
        }

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const changedDocs = snapshot
                .docChanges()
                .filter((change) => change.type === "added" || change.type === "modified")
                .map((change) => ({ id: change.doc.id, ...change.doc.data() } as any));

            if (changedDocs.length === 0) return;

            const lowStockItems = changedDocs.filter((item) => getStockStatus(item).status === "low");
            if (lowStockItems.length === 0) return;

            const config = await getFreshNotificationsConfig();
            if (!config.stock) return;

            for (const item of lowStockItems) {
                const notifId = `${item.id}-low-stock`;
                const notifRef = doc(db, `users/${user.uid}/notifications/${notifId}`);
                const notifSnap = await getDoc(notifRef);

                if (!notifSnap.exists()) {
                    await setDoc(notifRef, {
                        relatedItemId: item.id,
                        type: "warning",
                        category: "stock",
                        title: `Estoque Baixo - ${item.name}`,
                        message: `O estoque de ${item.name} está abaixo do mínimo (${item.quantity}/${item.minStock})`,
                        read: false,
                        resolved: false,
                        createdAt: serverTimestamp(),
                    });
                    continue;
                }

                const existing = notifSnap.data();
                const resolved = existing?.resolved ?? false;
                const resolvedAt = existing?.resolvedAt?.toMillis?.() || 0;
                const itemUpdatedAt = item.updatedAt?.toMillis?.() || 0;

                if (resolved && itemUpdatedAt <= resolvedAt) continue;
                if (!resolved) continue;

                await updateDoc(notifRef, {
                    resolved: false,
                    read: false,
                    createdAt: serverTimestamp(),
                });
            }
        }, 400);
    });

    return unsubscribe;
}

export function subscribeToNotifications(callback: (notifs: UserNotification[]) => void) {
    const user = auth.currentUser;
    if (!user) return () => {};

    const ref = collection(db, `users/${user.uid}/notifications`);

    const unsubscribe = onSnapshot(ref, (snapshot) => {
        const list: UserNotification[] = snapshot.docs
            .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<UserNotification, "id">) }))
            .filter((n) => !n.resolved);
        callback(list);
    });

    return unsubscribe;
}
