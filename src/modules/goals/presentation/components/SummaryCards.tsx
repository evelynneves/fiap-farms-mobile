import { AlertCircle, CheckCircle, Clock } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
    active: number;
    completed: number;
    overdue: number;
}

export function SummaryCards({ active, completed, overdue }: Props) {
    return (
        <View style={styles.wrap}>
            <View style={[styles.card, styles.cardBlue]}>
                <View>
                    <Text style={styles.title}>Metas Ativas</Text>
                    <Text style={styles.value}>{active}</Text>
                </View>
                <View style={[styles.icon, styles.iconBlue]}>
                    <Clock size={18} color="#2563EB" />
                </View>
            </View>

            <View style={[styles.card, styles.cardGreen]}>
                <View>
                    <Text style={styles.title}>Concluídas</Text>
                    <Text style={styles.value}>{completed}</Text>
                </View>
                <View style={[styles.icon, styles.iconGreen]}>
                    <CheckCircle size={18} color="#16A34A" />
                </View>
            </View>

            <View style={[styles.card, styles.cardRed]}>
                <View>
                    <Text style={styles.title}>Atrasadas</Text>
                    <Text style={styles.value}>{overdue}</Text>
                </View>
                <View style={[styles.icon, styles.iconRed]}>
                    <AlertCircle size={18} color="#DC2626" />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flexDirection: "row", gap: 12, marginBottom: 16 },
    card: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
        position: "relative",
    },
    // “faixa” lateral simulada com borderLeftColor
    cardBlue: { borderLeftWidth: 6, borderLeftColor: "#60A5FA" },
    cardGreen: { borderLeftWidth: 6, borderLeftColor: "#22C55E" },
    cardRed: { borderLeftWidth: 6, borderLeftColor: "#EF4444" },

    title: { color: "#6B7280", fontSize: 13, marginBottom: 2 },
    value: { color: "#111827", fontWeight: "700", fontSize: 22 },
    icon: { padding: 10, borderRadius: 10 },
    iconBlue: { backgroundColor: "rgba(59,130,246,0.15)" },
    iconGreen: { backgroundColor: "rgba(16,185,129,0.15)" },
    iconRed: { backgroundColor: "rgba(239,68,68,0.15)" },
});
