import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from "firebase/auth";
import { Platform } from "react-native";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

// Garante app único (evita “already exists” em hot reload)
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let _auth: Auth;
if (Platform.OS === "web") {
    // Web: getAuth(app) é suficiente (se quiser, dá pra setar browserLocalPersistence)
    _auth = getAuth(app);
} else {
    // Native: initializeAuth só pode ser chamado uma vez
    try {
        _auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
    } catch {
        // se já foi inicializado (hot reload), reaproveita
        _auth = getAuth(app);
    }
}

export const auth = _auth;
