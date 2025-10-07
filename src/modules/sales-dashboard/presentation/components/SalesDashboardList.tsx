import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

type Row = { product: string; revenue: number; profit: number; units: number };
type Props = { salesData: Row[] };

const currency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function SalesDashboardList({ salesData }: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.h3}>Detalhamento por Produto</Text>
            <Text style={styles.sub}>Performance completa de todos os produtos</Text>

            <View style={styles.headerRow}>
                <Text style={[styles.th, { flex: 2 }]}>Produto</Text>
                <Text style={[styles.th, styles.right]}>Receita</Text>
                <Text style={[styles.th, styles.right]}>Lucro</Text>
                <Text style={[styles.th, styles.right]}>Unid.</Text>
            </View>

            <FlatList
                data={salesData}
                keyExtractor={(i) => i.product}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={[styles.td, { flex: 2 }]}>{item.product}</Text>
                        <Text style={[styles.td, styles.right]}>{currency(item.revenue)}</Text>
                        <Text style={[styles.td, styles.right, styles.bold]}>{currency(item.profit)}</Text>
                        <Text style={[styles.td, styles.right]}>{item.units}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 10, padding: 16 },
    h3: { fontSize: 16, fontWeight: "700", color: "#111827" },
    sub: { fontSize: 13, color: "#6B7280", marginTop: 2, marginBottom: 12 },

    headerRow: { flexDirection: "row", paddingVertical: 6 },
    th: { color: "#374151", fontWeight: "700", fontSize: 12 },
    row: { flexDirection: "row", paddingVertical: 10 },
    td: { color: "#111827", fontSize: 13 },
    right: { textAlign: "right", flex: 1 },
    sep: { height: 1, backgroundColor: "#E5E7EB" },
    bold: { fontWeight: "700" },
});
