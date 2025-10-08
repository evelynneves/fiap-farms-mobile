import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

type Row = { product: string; revenue: number; profit: number; units: number; id: string };
type Props = { salesData: Row[] };

const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    }).format(v);

export default function SalesDashboardList({ salesData }: Props) {
    const renderItem = ({ item, index }: { item: Row; index: number }) => (
        <View style={[styles.itemCard, index % 2 !== 0 && styles.altCard]}>
            <Text style={styles.productName}>{item.product}</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Receita:</Text>
                <Text style={styles.value}>{currency(item.revenue)}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Lucro:</Text>
                <Text style={[styles.value, styles.profit]}>{currency(item.profit)}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Unid.:</Text>
                <Text style={styles.value}>{item.units}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.card}>
            <Text style={styles.h3}>Detalhamento por Produto</Text>
            <Text style={styles.sub}>Performance completa de todos os produtos</Text>

            <FlatList
                data={salesData}
                keyExtractor={(item, index) => item.id ?? `${item.product}-${index}`}
                renderItem={renderItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        borderRadius: 10,
        padding: 16,
        marginTop: 16,
    },
    h3: { fontSize: 16, fontWeight: "700", color: "#111827" },
    sub: { fontSize: 13, color: "#6B7280", marginTop: 2, marginBottom: 12 },

    itemCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    altCard: {
        backgroundColor: "#FFFFFF",
    },
    productName: {
        fontWeight: "700",
        color: "#111827",
        fontSize: 14,
        marginBottom: 4,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 2,
    },
    label: { color: "#6B7280", fontSize: 13 },
    value: { color: "#111827", fontSize: 13, fontWeight: "500" },
    profit: { color: "#166534", fontWeight: "700" },
    sep: { height: 10 },
});
