/******************************************************************************
 *                                                                             *
 * Creation Date : 16/04/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 ******************************************************************************/

import { router } from "expo-router";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    type User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../infrastructure/firebase/firebaseConfig";

type AuthContextProps = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (fbUser) => {
            setUser(fbUser ?? null);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace("/(logged)/home");
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            router.replace("/(unlogged)/login");
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        setLoading(true);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(res.user, { displayName: name });
            router.replace("/(logged)/home");
        } finally {
            setLoading(false);
        }
    };

    const value = useMemo(() => ({ user, loading, login, logout, signUp }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
