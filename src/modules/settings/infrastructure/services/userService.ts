/******************************************************************************
 *                                                                             *
 * Creation Date : 06/10/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 ******************************************************************************/

import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import { onAuthStateChanged, updateProfile, type User } from "firebase/auth";

type MinimalUser = {
    id: string;
    name: string | null;
    email: string | null;
    photoURL?: string | null;
};

/**
 * Escuta mudanças de autenticação e devolve um usuário minimalista ou null.
 * Retorna a função de unsubscribe do Firebase.
 */
export function subscribeToAuthChanges(callback: (user: MinimalUser | null) => void) {
    return onAuthStateChanged(auth, (u: User | null) => {
        if (u) {
            callback({
                id: u.uid,
                name: u.displayName,
                email: u.email,
                photoURL: u.photoURL ?? null,
            });
        } else {
            callback(null);
        }
    });
}

/**
 * Atualiza o perfil do usuário autenticado (nome/ avatar).
 */
export async function handleUpdateProfile(data: { name: string; avatar?: string }): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        console.warn("handleUpdateProfile: usuário não autenticado.");
        return;
    }

    try {
        await updateProfile(user, {
            displayName: data.name,
            photoURL: data.avatar || null,
        });
    } catch (err) {
        console.error("Erro ao atualizar perfil:", err);
        throw err;
    }
}
