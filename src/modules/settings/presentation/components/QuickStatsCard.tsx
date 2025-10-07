import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const QuickStatsCard: React.FC = () => {
    const [lastLogin, setLastLogin] = useState<string>("");

    useEffect(() => {
        const ts = auth.currentUser?.metadata?.lastSignInTime;
        if (!ts) return;
        const date = new Date(ts);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        const formatted = isToday
            ? `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
            : `${date.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
              })} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

        setLastLogin(formatted);
    }, []);

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Estatísticas Rápidas</Text>
            <View style={styles.list}>
                <View style={styles.row}>
                    <Text style={styles.label}>Último acesso:</Text>
                    <Text style={styles.value}>{lastLogin || "Carregando..."}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Metas ativas:</Text>
                    <Text style={styles.value}>3</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Fazendas:</Text>
                    <Text style={styles.value}>87</Text>
                </View>
            </View>
        </View>
    );
};

export default QuickStatsCard;

const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 16 },
    title: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
    list: { gap: 8 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    label: { color: "#4B5563", fontSize: 14 },
    value: { color: "#000", fontWeight: "700", fontSize: 14 },
});
