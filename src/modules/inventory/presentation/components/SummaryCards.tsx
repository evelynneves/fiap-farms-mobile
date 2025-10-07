import { CheckCircle, Package, TrendingDown } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    totalItems: number;
    lowStockCount: number;
    totalValue: number;
};

export function SummaryCards({ totalItems, lowStockCount, totalValue }: Props) {
    return (
        <View style={styles.grid}>
            <Card
                accent="#60A5FA"
                icon={<Package size={18} color="#2563EB" />}
                title="Total de Itens"
                value={`${totalItems}`}
                iconBg="#EFF6FF"
                iconBorder="#BFDBFE"
            />
            <Card
                accent="#EF4444"
                icon={<TrendingDown size={18} color="#DC2626" />}
                title="Estoque Baixo"
                value={`${lowStockCount}`}
                iconBg="#FEE2E2"
                iconBorder="#FECACA"
                valueColor="#DC2626"
            />
            <Card
                accent="#22C55E"
                icon={<CheckCircle size={18} color="#16A34A" />}
                title="Valor Total"
                value={`R$ ${totalValue.toLocaleString()}`}
                iconBg="#DCFCE7"
                iconBorder="#BBF7D0"
            />
        </View>
    );
}

function Card({
    accent,
    icon,
    title,
    value,
    iconBg,
    iconBorder,
    valueColor,
}: {
    accent: string;
    icon: React.ReactNode;
    title: string;
    value: string;
    iconBg: string;
    iconBorder: string;
    valueColor?: string;
}) {
    return (
        <View style={[styles.card, { borderLeftColor: accent }]}>
            <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={[styles.value, !!valueColor && { color: valueColor }]}>{value}</Text>
            </View>
            <View style={[styles.icon, { backgroundColor: iconBg, borderColor: iconBorder }]}>{icon}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { gap: 12, marginBottom: 16 },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        position: "relative",
        overflow: "hidden",
        borderLeftWidth: 6,
    },
    title: { color: "#6B7280", fontSize: 13, marginBottom: 2 },
    value: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
    icon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
