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
import { onAuthStateChanged, updateProfile, User } from "firebase/auth";

/**
 * Escuta mudanças de autenticação em tempo real.
 * Ideal para atualizar a UI quando o usuário loga ou desloga.
 *
 * @param callback Função chamada sempre que o estado de autenticação mudar.
 * @returns Função para cancelar a inscrição no listener.
 */
export function subscribeToAuthChanges(
    callback: (user: { id: string; name: string | null; email: string | null } | null) => void
) {
    return onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
            callback({
                id: firebaseUser.uid,
                name: firebaseUser.displayName,
                email: firebaseUser.email,
            });
        } else {
            callback(null);
        }
    });
}

/**
 * Atualiza o perfil do usuário autenticado no Firebase.
 * Pode ser usado para alterar o nome ou o avatar.
 *
 * @param data Objeto contendo o nome e opcionalmente o avatar.
 */
export async function handleUpdateProfile(data: { name: string; avatar?: string }): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        console.warn("Tentativa de atualizar perfil sem usuário autenticado.");
        return;
    }

    try {
        await updateProfile(user, {
            displayName: data.name,
            photoURL: data.avatar || null,
        });
        console.log("Perfil atualizado com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw error;
    }
}
