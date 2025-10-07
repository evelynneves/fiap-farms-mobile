import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

type Row = { product: string; revenue: number; profit: number; growth: number; units: number };
type Props = { salesData: Row[] };

const currency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function TopProducts({ salesData }: Props) {
    const topProducts = useMemo(() => [...salesData].sort((a, b) => b.profit - a.profit).slice(0, 3), [salesData]);

    return (
        <View style={styles.card}>
            <View style={{ marginBottom: 12 }}>
                <Text style={styles.h3}>Produtos com Maior Lucro</Text>
                <Text style={styles.sub}>Ranking dos produtos mais lucrativos no período</Text>
            </View>

            <FlatList
                data={topProducts}
                keyExtractor={(i) => i.product}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                renderItem={({ item, index }) => (
                    <View style={styles.item}>
                        <View style={styles.info}>
                            <View style={styles.rank}>
                                <Text style={styles.rankTxt}>#{index + 1}</Text>
                            </View>
                            <View>
                                <Text style={styles.product}>{item.product}</Text>
                                <Text style={styles.units}>{item.units} unidades vendidas</Text>
                            </View>
                        </View>

                        <View style={{ alignItems: "flex-end" }}>
                            <Text style={styles.profit}>{currency(item.profit)}</Text>
                            {/* growth opcional futuramente */}
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 10, padding: 16 },
    h3: { fontSize: 16, fontWeight: "700", color: "#111827" },
    sub: { fontSize: 13, color: "#6B7280", marginTop: 2 },

    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        padding: 12,
    },
    info: { flexDirection: "row", alignItems: "center", gap: 12 },
    rank: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#DCFCE7",
        alignItems: "center",
        justifyContent: "center",
    },
    rankTxt: { color: "#16a34a", fontWeight: "700", fontSize: 13 },
    product: { fontWeight: "600", color: "#111827" },
    units: { fontSize: 12, color: "#6B7280" },
    profit: { fontWeight: "700", color: "#111827" },
});
