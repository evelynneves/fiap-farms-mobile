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
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * Tipo de notificação do sistema.
 */
export type Notification = {
    id?: string;
    type: "success" | "warning" | "info";
    category: "stock" | "goals" | "production";
    title: string;
    message: string;
    timestamp?: any;
    read?: boolean;
};

/**
 * Adiciona uma nova notificação na coleção do usuário autenticado.
 */
export async function addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        console.warn("Tentativa de adicionar notificação sem usuário autenticado.");
        return;
    }

    const ref = collection(db, "users", user.uid, "notifications");
    await addDoc(ref, {
        ...notification,
        read: false,
        timestamp: serverTimestamp(),
    });
}

/**
 * Retorna as configurações atuais de notificações do usuário autenticado.
 * Caso não exista configuração, retorna os valores padrão (todas habilitadas).
 */
export async function getFreshNotificationsConfig(): Promise<{
    stock: boolean;
    goals: boolean;
    production: boolean;
}> {
    const user = auth.currentUser;
    if (!user) {
        return { stock: true, goals: true, production: true };
    }

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        return { stock: true, goals: true, production: true };
    }

    const data = snap.data();
    return data.notifications ?? { stock: true, goals: true, production: true };
}
