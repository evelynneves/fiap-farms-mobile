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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface UserNotification {
    id: string;
    type: "success" | "warning" | "info";
    category: "stock" | "goals" | "production";
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

// Em mobile, use um cache por usuário para evitar colisões entre sessões.
const storageKeyFor = (uid: string) => `user_notifications:${uid}`;

/**
 * Lê as notificações do usuário.
 * - Primeiro tenta o cache local (AsyncStorage).
 * - Se não houver, busca no Firestore (campo `notifications` do doc do usuário).
 * - Se o doc não existir, cria com array vazio.
 */
export async function getUserNotifications(): Promise<UserNotification[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const key = storageKeyFor(user.uid);

    try {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) return parsed as UserNotification[];
        }
    } catch {}

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    let list: UserNotification[] = [];
    if (snap.exists()) {
        const data = snap.data() as { notifications?: unknown };
        if (Array.isArray(data.notifications)) {
            list = data.notifications as UserNotification[];
        } else {
            list = [];
            await setDoc(ref, { notifications: [] }, { merge: true });
        }
    } else {
        await setDoc(ref, { notifications: [] }, { merge: true });
    }

    try {
        await AsyncStorage.setItem(key, JSON.stringify(list));
    } catch {}

    return list;
}

/**
 * Persiste as notificações do usuário no Firestore e atualiza o cache local.
 */
export async function setUserNotifications(list: UserNotification[]): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const key = storageKeyFor(user.uid);
    const ref = doc(db, "users", user.uid);

    await updateDoc(ref, { notifications: Array.isArray(list) ? list : [] });

    try {
        await AsyncStorage.setItem(key, JSON.stringify(Array.isArray(list) ? list : []));
    } catch {
        // ignora erro de cache
    }
}

/**
 * Limpa o cache local das notificações do usuário atual.
 */
export async function clearUserNotificationsCache(): Promise<void> {
    const user = auth.currentUser;

    // Se houver usuário, remova a chave específica dele.
    if (user) {
        try {
            await AsyncStorage.removeItem(storageKeyFor(user.uid));
        } catch {
            // ignora erro de cache
        }
    }

    // Back-compat: remove também a chave genérica, caso exista de versões antigas
    try {
        await AsyncStorage.removeItem("user_notifications");
    } catch {
        // ignora erro de cache
    }
}
