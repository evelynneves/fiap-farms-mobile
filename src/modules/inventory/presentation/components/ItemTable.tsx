import { DollarSign, Edit, Layers, MapPin, Package, Trash2 } from "lucide-react-native";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Item } from "../../domain/entities/Item";
import { getStockStatus } from "../../utils/getStockStatus";

type Props = {
    items: Item[];
    onEdit: (item: Item) => void;
    onDelete: (id: string) => void;
};

export function ItemList({ items, onEdit, onDelete }: Props) {
    return (
        <FlatList
            data={items}
            scrollEnabled={false}
            keyExtractor={(it, idx) => it.id ?? `item-${idx}`}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => {
                const s = getStockStatus(item);
                const tone = s.status;

                return (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.titleWrap}>
                                <Package size={16} color="#16A34A" />
                                <Text style={styles.title}>{item.name}</Text>
                            </View>

                            <View style={styles.badgesWrap}>
                                <Badge tone={tone}>{s.label}</Badge>
                                {item.hasRelatedGoal && <Badge tone="goal">Meta Vinculada</Badge>}
                            </View>
                        </View>

                        <View style={styles.infoGroup}>
                            <View style={styles.infoRow}>
                                <Layers size={14} color="#6B7280" />
                                <Text style={styles.infoTxt}>{item.category}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <MapPin size={14} color="#6B7280" />
                                <Text style={styles.infoTxt}>{item.farm}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Quantidade:</Text>
                                <Text style={styles.infoValue}>
                                    {item.quantity} {item.unit}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Estoque mínimo:</Text>
                                <Text style={styles.infoValue}>
                                    {item.minStock} {item.unit}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <DollarSign size={14} color="#6B7280" />
                                <Text style={styles.infoValue}>R$ {item.costPrice.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <Pressable
                                onPress={() => onEdit(item)}
                                style={[styles.btn, styles.btnSecondary]}
                                accessibilityLabel="Editar item"
                            >
                                <Edit size={16} color="#111827" />
                                <Text style={styles.btnTxt}>Editar</Text>
                            </Pressable>

                            <Pressable
                                disabled={!!item.hasRelatedGoal}
                                onPress={() => item.id && onDelete(item.id)}
                                style={[styles.btn, styles.btnDanger, item.hasRelatedGoal && styles.btnDisabled]}
                                accessibilityLabel="Excluir item"
                            >
                                <Trash2 size={16} color="#DC2626" />
                                <Text style={[styles.btnTxt, { color: "#DC2626" }]}>Excluir</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            }}
            ListEmptyComponent={<Text style={styles.empty}>Nenhum item encontrado no estoque.</Text>}
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
    badgesWrap: {
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
    },
    infoGroup: { gap: 6, marginTop: 4, marginBottom: 12 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    infoTxt: { color: "#374151", fontSize: 14 },
    infoLabel: { color: "#6B7280", fontSize: 13 },
    infoValue: { color: "#111827", fontWeight: "600" },
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
