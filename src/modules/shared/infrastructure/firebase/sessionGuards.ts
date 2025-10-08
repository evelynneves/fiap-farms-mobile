import { onAuthStateChanged, onIdTokenChanged, signOut, type User } from "firebase/auth";
import { auth } from "./firebaseConfig";

/** Event bus mínimo, compatível com RN */
type Handler = (...args: any[]) => void;
class TinyEmitter {
    private map = new Map<string, Set<Handler>>();

    on(event: string, cb: Handler) {
        let set = this.map.get(event);
        if (!set) {
            set = new Set();
            this.map.set(event, set);
        }
        set.add(cb);
        return () => this.off(event, cb);
    }

    once(event: string, cb: Handler) {
        const off = this.on(event, (...args) => {
            off();
            cb(...args);
        });
        return off;
    }

    off(event: string, cb: Handler) {
        this.map.get(event)?.delete(cb);
    }

    emit(event: string, ...args: any[]) {
        this.map.get(event)?.forEach((cb) => cb(...args));
    }
}

export const authBus = new TinyEmitter();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let bootstrapped = false;

onAuthStateChanged(auth, (u) => {
    bootstrapped = true;
    authBus.emit("auth:state", u);
    authBus.emit(u ? "auth:login" : "auth:logout", u);
});

onIdTokenChanged(auth, (u) => {
    authBus.emit("auth:token", u);
});

export function waitUntilSignedIn(timeoutMs = 8000): Promise<void> {
    if (auth.currentUser) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
        const to = setTimeout(() => {
            off();
            reject(new Error("Timeout aguardando login"));
        }, timeoutMs);
        const off = authBus.on("auth:login", () => {
            clearTimeout(to);
            off();
            resolve();
        });
    });
}

export function waitUntilSignedOut(timeoutMs = 8000): Promise<void> {
    if (!auth.currentUser) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
        const to = setTimeout(() => {
            off();
            reject(new Error("Timeout aguardando logout"));
        }, timeoutMs);
        const off = authBus.on("auth:logout", () => {
            clearTimeout(to);
            off();
            resolve();
        });
    });
}

/** Logout simples (pode combinar com waitUntilSignedOut no caller) */
export async function signOutCurrentUser() {
    await signOut(auth);
}

/** Utilidade opcional */
export function onAuthState(cb: (u: User | null) => void) {
    return authBus.on("auth:state", cb);
}
