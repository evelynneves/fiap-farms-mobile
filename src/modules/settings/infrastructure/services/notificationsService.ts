import { db } from "@/src/modules/shared/infrastructure/firebase";
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import { collection, doc, getDoc, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";

export type NotificationsConfig = {
    stock: boolean;
    goals: boolean;
    production: boolean;
};

const DEFAULT_CONFIG: NotificationsConfig = {
    stock: true,
    goals: true,
    production: true,
};

export async function getNotifications(): Promise<NotificationsConfig> {
    const user = auth.currentUser;
    if (!user) return DEFAULT_CONFIG;

    const userRef = doc(db, `users/${user.uid}`);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        const data = snap.data();
        return {
            stock: data.notifications?.stock ?? true,
            goals: data.notifications?.goals ?? true,
            production: data.notifications?.production ?? true,
        };
    }

    await setDoc(userRef, { notifications: DEFAULT_CONFIG }, { merge: true });
    return DEFAULT_CONFIG;
}

export async function setNotifications(config: NotificationsConfig): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const userRef = doc(db, `users/${user.uid}`);
    await setDoc(userRef, { notifications: config }, { merge: true });
}

const getUserNotificationsCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    return collection(db, `users/${user.uid}/notifications`);
};

export async function markNotificationAsRead(id: string): Promise<void> {
    const ref = doc(getUserNotificationsCollection(), id);
    await updateDoc(ref, { read: true });
}

export async function markAllNotificationsAsRead(ids: string[]): Promise<void> {
    if (!ids.length) return;

    const batch = writeBatch(db);
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    ids.forEach((id) => {
        const ref = doc(db, `users/${user.uid}/notifications/${id}`);
        batch.update(ref, { read: true });
    });

    await batch.commit();
}

export async function resolveNotification(id: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const ref = doc(db, `users/${user.uid}/notifications/${id}`);
    await updateDoc(ref, {
        resolved: true,
        resolvedAt: serverTimestamp(),
        read: true,
    });
}
