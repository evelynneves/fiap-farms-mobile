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
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore";

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

/**
 * Lê a configuração de notificações do usuário autenticado.
 * Se não existir, cria com defaults e devolve.
 */
export async function getNotifications(): Promise<NotificationsConfig> {
    const user = auth.currentUser;
    if (!user) {
        // Em mobile o auth pode demorar a hidratar; devolvemos defaults para evitar travar a UI.
        return DEFAULT_CONFIG;
    }

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const data = snap.data() as { notifications?: Partial<NotificationsConfig> };
        return {
            stock: data.notifications?.stock ?? true,
            goals: data.notifications?.goals ?? true,
            production: data.notifications?.production ?? true,
        };
    } else {
        await setDoc(ref, { notifications: DEFAULT_CONFIG }, { merge: true });
        return DEFAULT_CONFIG;
    }
}

/**
 * Persiste a configuração de notificações.
 */
export async function setNotifications(config: NotificationsConfig): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        console.warn("setNotifications: usuário não autenticado.");
        return;
    }
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { notifications: config }, { merge: true });
}

/** Utilitário para pegar a subcoleção de notificações do usuário. */
const getUserNotificationsCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    return collection(db, "users", user.uid, "notifications");
};

/**
 * Marca uma notificação como lida.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
    const ref = doc(getUserNotificationsCollection(), id);
    await updateDoc(ref, { read: true });
}

/**
 * Marca várias notificações como lidas em batch (mais eficiente).
 */
export async function markAllNotificationsAsRead(ids: string[]): Promise<void> {
    if (!ids?.length) return;
    const batch = writeBatch(db);
    ids.forEach((id) => {
        const ref = doc(getUserNotificationsCollection(), id);
        batch.update(ref, { read: true });
    });
    await batch.commit();
}

/**
 * Exclui uma notificação.
 */
export async function deleteNotification(id: string): Promise<void> {
    const ref = doc(getUserNotificationsCollection(), id);
    await deleteDoc(ref);
}
