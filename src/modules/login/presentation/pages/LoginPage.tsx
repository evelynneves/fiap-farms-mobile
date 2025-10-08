import { Sprout } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { LoginForm } from "../components/LoginForm";

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <SafeAreaView style={s.page}>
            <View style={s.card}>
                <View style={s.iconWrap}>
                    <Sprout size={32} color="#16A34A" />
                </View>
                <Text style={s.title}>FIAP Farms</Text>
                <Text style={s.subtitle}>{isLogin ? "Entre na sua conta" : "Crie sua conta"}</Text>

                <LoginForm isLogin={isLogin} setIsLogin={setIsLogin} />
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: "#F0FDF4",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    iconWrap: {
        backgroundColor: "#DCFCE7",
        width: 60,
        height: 60,
        borderRadius: 999,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "800", color: "#166534", textAlign: "center", marginBottom: 4 },
    subtitle: { color: "#4B5563", textAlign: "center", marginBottom: 16 },
});
