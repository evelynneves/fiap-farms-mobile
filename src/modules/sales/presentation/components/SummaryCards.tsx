// components/SummaryCards.tsx
import { Calendar, DollarSign, Package } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const formatCurrency = (v: number) =>
    (typeof Intl !== "undefined"
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
        : { format: (x: number) => `R$ ${x.toFixed(2)}` }
    ).format(v);

type Props = {
    totalRevenue: number;
    totalQuantity: number;
    totalSales: number;
};

export function SummaryCards({ totalRevenue, totalQuantity, totalSales }: Props) {
    return (
        <View style={styles.grid}>
            <View style={[styles.card, styles.accentGreen]}>
                <View>
                    <Text style={styles.label}>Total de Vendas</Text>
                    <Text style={styles.value}>{formatCurrency(totalRevenue)}</Text>
                </View>
                <View style={[styles.iconBox, styles.iconGreen]}>
                    <DollarSign size={18} color="#10b981" />
                </View>
            </View>

            <View style={[styles.card, styles.accentBlue]}>
                <View>
                    <Text style={styles.label}>Quantidade Total</Text>
                    <Text style={styles.value}>{totalQuantity.toLocaleString()} un</Text>
                </View>
                <View style={[styles.iconBox, styles.iconBlue]}>
                    <Package size={18} color="#2563eb" />
                </View>
            </View>

            <View style={[styles.card, styles.accentPurple]}>
                <View>
                    <Text style={styles.label}>Vendas Registradas</Text>
                    <Text style={styles.value}>{totalSales}</Text>
                </View>
                <View style={[styles.iconBox, styles.iconPurple]}>
                    <Calendar size={18} color="#9333ea" />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { gap: 12, marginBottom: 16 },
    card: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: { color: "#6B7280", fontSize: 13, marginBottom: 2 },
    value: { color: "#111827", fontSize: 20, fontWeight: "700" },

    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    iconBlue: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
    iconPurple: { backgroundColor: "#f3e8ff", borderColor: "#e9d5ff" },
    iconGreen: { backgroundColor: "#ecfdf5", borderColor: "#bbf7d0" },

    accentBlue: { borderLeftWidth: 3, borderLeftColor: "#2563eb", paddingLeft: 10 },
    accentPurple: { borderLeftWidth: 3, borderLeftColor: "#9333ea", paddingLeft: 10 },
    accentGreen: { borderLeftWidth: 3, borderLeftColor: "#10b981", paddingLeft: 10 },
});
