import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";

export type User = { id: string; name: string; email: string };

export function getCurrentUser(): User | null {
    const u = auth.currentUser;
    return u ? { id: u.uid, name: u.displayName ?? "", email: u.email ?? "" } : null;
}

function waitUntilSignedIn(timeoutMs = 8000) {
    return new Promise<void>((resolve, reject) => {
        const to = setTimeout(() => {
            unsub();
            reject(new Error("Timeout aguardando login"));
        }, timeoutMs);

        const unsub = onAuthStateChanged(auth, (u) => {
            if (u) {
                clearTimeout(to);
                unsub();
                resolve();
            }
        });
    });
}

export async function loginUser(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await waitUntilSignedIn();
    const mini: User = { id: user.uid, name: user.displayName ?? "", email: user.email ?? "" };
    await AsyncStorage.setItem("user", JSON.stringify(mini));
    router.replace("/(logged)/home");
    return mini;
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    if (name && !user.displayName) await updateProfile(user, { displayName: name });
    await waitUntilSignedIn();
    const mini: User = { id: user.uid, name: user.displayName ?? name, email: user.email ?? "" };
    await AsyncStorage.setItem("user", JSON.stringify(mini));
    router.replace("/(logged)/home");
    return mini;
}

export async function logoutUser(): Promise<void> {
    try {
        await AsyncStorage.removeItem("user");
    } catch {}
    await signOut(auth);
    router.replace("/(unlogged)/login");
}
