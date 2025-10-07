import { DollarSign, Package, TrendingUp, Users } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = { revenue: number; profit: number; productsSold: number; activeFarms: number };

const currency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function SummaryCards({ revenue, profit, productsSold, activeFarms }: Props) {
    return (
        <View style={styles.grid}>
            <Card title="Receita Total" value={currency(revenue)} icon={<DollarSign size={18} color="#16a34a" />} />
            <Card title="Lucro Total" value={currency(profit)} icon={<TrendingUp size={18} color="#16a34a" />} />
            <Card
                title="Produtos Vendidos"
                value={`${productsSold.toLocaleString()} un`}
                icon={<Package size={18} color="#16a34a" />}
            />
            <Card title="Fazendas Ativas" value={String(activeFarms)} icon={<Users size={18} color="#16a34a" />} />
        </View>
    );
}

function Card({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <View style={styles.card}>
            <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
            <View style={styles.icon}>{icon}</View>
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
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { color: "#6B7280", fontSize: 13, marginBottom: 2 },
    value: { color: "#111827", fontSize: 22, fontWeight: "800" },
    icon: { padding: 10, borderRadius: 10, backgroundColor: "rgba(34,197,94,0.15)" },
});
