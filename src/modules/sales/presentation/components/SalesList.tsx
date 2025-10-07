// components/SalesList.tsx
import { Edit, Trash2 } from "lucide-react-native";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { Sale } from "../../domain/entities/Sale";

const formatCurrency = (v: number) =>
    (typeof Intl !== "undefined"
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
        : { format: (x: number) => `R$ ${x.toFixed(2)}` }
    ).format(v);

type Props = {
    sales: (Sale & { hasRelatedGoal?: boolean })[];
    onEdit: (sale: Sale) => void;
    onDelete: (id: string) => void;
};

export function SalesList({ sales, onEdit, onDelete }: Props) {
    return (
        <View style={styles.card}>
            <FlatList
                data={sales}
                keyExtractor={(s) => s.id}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{item.productName}</Text>
                            <Text style={styles.sub}>{item.farmName}</Text>
                        </View>

                        <View style={styles.colRight}>
                            <Text style={styles.value}>{item.quantity.toLocaleString()}</Text>
                            <Text style={styles.hint}>Qtd</Text>
                        </View>

                        <View style={styles.colRight}>
                            <Text style={styles.value}>{formatCurrency(item.salePrice)}</Text>
                            <Text style={styles.hint}>Unit.</Text>
                        </View>

                        <View style={styles.colRight}>
                            <Text style={[styles.value, styles.bold]}>{formatCurrency(item.totalValue)}</Text>
                            <Text style={styles.hint}>{new Date(item.date).toLocaleDateString("pt-BR")}</Text>
                        </View>

                        <View style={styles.actions}>
                            <Pressable onPress={() => onEdit(item)} style={styles.actionBtn}>
                                <Edit size={18} color="#374151" />
                            </Pressable>

                            <Pressable
                                disabled={!!item.hasRelatedGoal}
                                onPress={() => onDelete(item.id)}
                                style={[styles.actionBtn, item.hasRelatedGoal && { opacity: 0.4 }]}
                            >
                                <Trash2 size={18} color="#dc2626" />
                            </Pressable>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#fff",
        borderRadius: 8,
        overflow: "hidden",
    },
    sep: { height: 1, backgroundColor: "#E5E7EB" },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    title: { fontSize: 14, fontWeight: "600", color: "#111827" },
    sub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
    colRight: { minWidth: 76, alignItems: "flex-end" },
    value: { fontSize: 13, color: "#111827" },
    hint: { fontSize: 11, color: "#6B7280" },
    bold: { fontWeight: "700" },
    actions: { flexDirection: "row", gap: 6, marginLeft: 6 },
    actionBtn: {
        padding: 6,
        borderRadius: 6,
    },
});
