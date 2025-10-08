import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import AboutCard from "../components/AboutCard";
import AccountCard from "../components/AccountCard";
import { AlertMessage } from "../components/AlertMessage";
import LogoutCard from "../components/LogoutCard";
import ProfileCard, { ProfileData } from "../components/ProfileCard";
import QuickStatsCard from "../components/QuickStatsCard";

import { db } from "@/src/modules/shared/infrastructure/firebase";
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const SettingsScreen: React.FC = () => {
    const navigation = useNavigation();

    const [profileData, setProfileData] = useState<ProfileData>({
        name: "Carregando...",
        email: "",
        avatar: "",
    });

    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (!alert) return;
        const t = setTimeout(() => setAlert(null), 3000);
        return () => clearTimeout(t);
    }, [alert]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigation.navigate("Login" as never);
                return;
            }
            try {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data() as any;
                    setProfileData({
                        name: data.name || user.displayName || "",
                        email: user.email || "",
                        avatar: data.avatar || user.photoURL || "",
                    });
                } else {
                    setProfileData({
                        name: user.displayName || "",
                        email: user.email || "",
                        avatar: user.photoURL || "",
                    });
                }
            } catch {
                setAlert({ type: "error", message: "Erro ao carregar informações do usuário." });
            }
        });

        return () => unsub();
    }, []);

    const persistProfile = async (data: ProfileData) => {
        try {
            const current = auth.currentUser;
            if (!current) return;

            const ref = doc(db, "users", current.uid);
            await setDoc(
                ref,
                {
                    name: data.name ?? "",
                    email: data.email ?? "",
                    avatar: data.avatar ?? "",
                },
                { merge: true }
            );

            setProfileData(data);
            setAlert({ type: "success", message: "Usuário editado com sucesso." });
        } catch {
            setAlert({ type: "error", message: "Erro ao salvar as informações do usuário." });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {alert && (
                    <View style={styles.alertBar}>
                        <AlertMessage type={alert.type} message={alert.message} />
                    </View>
                )}

                <View style={styles.main}>
                    <ProfileCard profileData={profileData} onSaveProfile={persistProfile} />
                    <AccountCard />
                </View>

                <View style={styles.aside}>
                    <AboutCard />
                    <LogoutCard navigate={(routeName: string) => navigation.navigate(routeName as never)} />
                    <QuickStatsCard />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafb" },
    content: { padding: 16, gap: 16 },
    alertBar: { marginBottom: 12 },
    main: { gap: 12 },
    aside: { gap: 12, marginTop: 8 },
});
