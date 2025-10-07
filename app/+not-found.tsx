import { useAuth } from "@/src/modules/shared/contexts/useAuthContext";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Error404Screen() {
    const router = useRouter();
    const { user } = useAuth();

    const handleBack = () => {
        if (user) {
            router.replace("/(logged)/home");
        } else {
            router.replace("/(unlogged)/login");
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
                <View style={styles.container}>
                    {/* Logo */}
                    <View style={styles.logoRow}>
                        <Text style={styles.logoIcon}>🌱</Text>
                        <Text style={styles.logoText}>FIAP Farms</Text>
                    </View>

                    {/* Ícone grande */}
                    <Text style={styles.bigIcon}>❌</Text>

                    {/* Mensagens */}
                    <View style={styles.message}>
                        <Text style={styles.h1}>404</Text>
                        <Text style={styles.h2}>Página não encontrada</Text>
                        <Text style={styles.p}>A página que você tentou acessar não existe ou foi removida.</Text>
                    </View>

                    {/* Ações */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.button} onPress={handleBack}>
                            <Text style={styles.buttonText}>Voltar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: "100%",
        padding: 24,
        backgroundColor: "#f9fafb",
        alignItems: "center",
        justifyContent: "center",
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 24,
    },
    logoIcon: {
        backgroundColor: "#dcfce7",
        color: "#16a34a",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        fontSize: 18,
        overflow: "hidden",
    },
    logoText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#065f46",
    },
    bigIcon: {
        backgroundColor: "#f3f4f6",
        borderRadius: 9999,
        padding: 16,
        fontSize: 48,
        color: "#9ca3af",
        marginBottom: 16,
        overflow: "hidden",
    },
    message: {
        alignItems: "center",
        marginBottom: 16,
    },
    h1: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 4,
    },
    h2: {
        fontSize: 20,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 6,
    },
    p: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
    },
    actions: {
        width: "100%",
        maxWidth: 300,
        marginTop: 8,
    },
    button: {
        width: "100%",
        backgroundColor: "#16a34a",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "600",
        fontSize: 16,
    },
});
