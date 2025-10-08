import { Calendar, Edit, Package, Trash2 } from "lucide-react-native";
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
        <FlatList
            data={sales}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ gap: 12 }}
            scrollEnabled={false}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.titleWrap}>
                            <Package size={16} color="#10B981" />
                            <Text style={styles.title}>{item.productName}</Text>
                        </View>
                        {item.hasRelatedGoal && <Badge tone="goal">Meta Vinculada</Badge>}
                    </View>

                    <View style={styles.infoGroup}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Fazenda:</Text>
                            <Text style={styles.value}>{item.farmName}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Quantidade:</Text>
                            <Text style={styles.value}>{item.quantity.toLocaleString()}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Preço Unitário:</Text>
                            <Text style={styles.value}>{formatCurrency(item.salePrice)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Valor Total:</Text>
                            <Text style={[styles.value, styles.bold]}>{formatCurrency(item.totalValue)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Calendar size={14} color="#6B7280" />
                            <Text style={styles.value}>{new Date(item.date).toLocaleDateString("pt-BR")}</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <Pressable onPress={() => onEdit(item)} style={[styles.btn, styles.btnSecondary]}>
                            <Edit size={16} color="#111827" />
                            <Text style={styles.btnTxt}>Editar</Text>
                        </Pressable>

                        <Pressable
                            disabled={!!item.hasRelatedGoal}
                            onPress={() => onDelete(item.id)}
                            style={[styles.btn, styles.btnDanger, item.hasRelatedGoal && styles.btnDisabled]}
                        >
                            <Trash2 size={16} color="#DC2626" />
                            <Text style={[styles.btnTxt, { color: "#DC2626" }]}>Excluir</Text>
                        </Pressable>
                    </View>
                </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Nenhuma venda registrada ainda.</Text>}
        />
    );
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: "low" | "warning" | "normal" | "goal" }) {
    let backgroundColor = "#E5E7EB";
    let textColor = "#111827";

    switch (tone) {
        case "low":
            backgroundColor = "#FEE2E2";
            textColor = "#991B1B";
            break;
        case "warning":
            backgroundColor = "#FEF9C3";
            textColor = "#92400E";
            break;
        case "normal":
            backgroundColor = "#DCFCE7";
            textColor = "#166534";
            break;
        case "goal":
            backgroundColor = "#FDE68A";
            textColor = "#92400E";
            break;
    }

    return (
        <View style={[bStyles.badge, { backgroundColor }]}>
            <Text style={[bStyles.badgeTxt, { color: textColor }]}>{children}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    titleWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
    title: { fontSize: 16, fontWeight: "700", color: "#111827" },
    infoGroup: { gap: 6, marginTop: 4, marginBottom: 12 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    label: { color: "#6B7280", fontSize: 13 },
    value: { color: "#111827", fontSize: 14, fontWeight: "500" },
    bold: { fontWeight: "700" },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 8,
    },
    btn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
    },
    btnTxt: { fontWeight: "600", fontSize: 12 },
    btnSecondary: { borderColor: "#D1D5DB", backgroundColor: "#FFF" },
    btnDanger: { borderColor: "#FECACA", backgroundColor: "#FFF5F5" },
    btnDisabled: { opacity: 0.6 },
    empty: {
        textAlign: "center",
        padding: 20,
        color: "#6B7280",
        fontStyle: "italic",
    },
});

const bStyles = StyleSheet.create({
    badge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: "flex-start",
    },
    badgeTxt: {
        fontSize: 12,
        fontWeight: "700",
    },
});
