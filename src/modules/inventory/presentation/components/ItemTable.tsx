import { Edit, Trash2 } from "lucide-react-native";
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
        <View style={styles.wrapper}>
            <View style={styles.headerRow}>
                <Text style={[styles.hCell, styles.flex2]}>Item</Text>
                <Text style={styles.hCell}>Categoria</Text>
                <Text style={styles.hCell}>Fazenda</Text>
                <Text style={[styles.hCell, styles.rightText]}>Qtd</Text>
                <Text style={[styles.hCell, styles.rightText]}>Est. mín.</Text>
                <Text style={[styles.hCell, styles.rightText]}>Custo</Text>
                <Text style={[styles.hCell, styles.centerText]}>Status</Text>
                <Text style={[styles.hCell, styles.centerText]}>Ações</Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={(it, idx) => it.id ?? `item-${idx}`} // ✅ fallback
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                renderItem={({ item }) => {
                    const s = getStockStatus(item);
                    const statusTone =
                        s.className === "status--low"
                            ? "status--low"
                            : s.className === "status--warning"
                            ? "status--warning"
                            : s.className === "status--ok"
                            ? "status--ok"
                            : undefined;

                    return (
                        <View style={styles.row}>
                            <Text style={[styles.cellText, styles.flex2]}>{item.name}</Text>

                            {/* Não envolva Badge (View) dentro de Text */}
                            <View style={styles.cellBox}>
                                <Badge>{item.category}</Badge>
                            </View>

                            <Text style={styles.cellText}>{item.farm}</Text>

                            <Text style={[styles.cellText, styles.rightText]}>
                                {item.quantity} {item.unit}
                            </Text>

                            <Text style={[styles.cellText, styles.rightText]}>
                                {item.minStock} {item.unit}
                            </Text>

                            <Text style={[styles.cellText, styles.rightText]}>R$ {item.costPrice.toFixed(2)}</Text>

                            <View style={[styles.cellBox, styles.centerBox]}>
                                <Badge tone={statusTone as any}>{s.label}</Badge>
                            </View>

                            <View style={[styles.cellBox, styles.centerBox]}>
                                <View style={styles.actions}>
                                    <Pressable onPress={() => onEdit(item)} style={styles.actionBtn}>
                                        <Edit size={16} color="#111827" />
                                    </Pressable>

                                    {item.hasRelatedGoal ? (
                                        <View style={[styles.actionBtn, styles.disabled]}>
                                            <Trash2 size={16} color="#DC2626" />
                                        </View>
                                    ) : (
                                        <Pressable
                                            disabled={!item.id}
                                            onPress={() => item.id && onDelete(item.id)} // ✅ só chama se tiver id
                                            style={[styles.actionBtn, !item.id && styles.disabled]}
                                        >
                                            <Trash2 size={16} color="#DC2626" />
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

function Badge({
    children,
    tone,
}: {
    children: React.ReactNode;
    tone?: "status--low" | "status--warning" | "status--ok";
}) {
    return (
        <View
            style={[
                bStyles.badge,
                tone === "status--low" && bStyles.low,
                tone === "status--warning" && bStyles.warn,
                tone === "status--ok" && bStyles.ok,
            ]}
        >
            <Text style={bStyles.badgeTxt}>{children}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        backgroundColor: "#FFF",
        overflow: "hidden",
    },
    headerRow: {
        backgroundColor: "#F9FAFB",
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    hCell: { flex: 1, fontSize: 12, fontWeight: "700", color: "#4B5563" },
    flex2: { flex: 2 },

    // Text vs View alignment styles
    rightText: { textAlign: "right" as const },
    centerText: { textAlign: "center" as const },
    centerBox: { alignItems: "center" as const },

    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    sep: { height: 1, backgroundColor: "#E5E7EB" },

    // separe estilos de Text e View
    cellText: { flex: 1, color: "#374151", fontSize: 13 },
    cellBox: { flex: 1 },

    actions: { flexDirection: "row", gap: 8, justifyContent: "center" },
    actionBtn: { padding: 6 },
    disabled: { opacity: 0.5 },
});

const bStyles = StyleSheet.create({
    badge: {
        backgroundColor: "#F3F4F6",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: "flex-start",
    },
    badgeTxt: { fontSize: 12, color: "#374151", fontWeight: "600" },
    low: { backgroundColor: "#FEE2E2" },
    warn: { backgroundColor: "#FEF9C3" },
    ok: { backgroundColor: "#DCFCE7" },
});
