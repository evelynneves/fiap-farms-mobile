import { Edit, MapPin, Sprout, Trash2, User } from "lucide-react-native";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Farm } from "../../domain/entities/Farm";

type Props = {
    farms: Farm[];
    onEdit: (farm: Farm) => void;
    onDelete: (id: string) => void;
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    Grãos: { bg: "#DCFCE7", color: "#166534" },
    Café: { bg: "#FEF3C7", color: "#92400E" },
    Frutas: { bg: "#DBEAFE", color: "#1E3A8A" },
    Hortaliças: { bg: "#E0E7FF", color: "#3730A3" },
    Leguminosas: { bg: "#FCE7F3", color: "#9D174D" },
    Outros: { bg: "#E0F2FE", color: "#075985" },
    default: { bg: "#F3F4F6", color: "#374151" },
};

export function FarmList({ farms, onEdit, onDelete }: Props) {
    return (
        <FlatList
            data={farms}
            keyExtractor={(item, i) => item.id || `farm-${i}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>Nenhuma fazenda cadastrada.</Text>}
            renderItem={({ item }) => {
                const typeStyle = TYPE_COLORS[item.productionType] || TYPE_COLORS.default;

                return (
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Sprout size={18} color="#10B981" />
                                <Text style={styles.title}>{item.name}</Text>
                            </View>

                            <View
                                style={[styles.badge, { backgroundColor: typeStyle.bg, borderColor: typeStyle.color }]}
                            >
                                <Text style={[styles.badgeText, { color: typeStyle.color }]}>
                                    {item.productionType || "—"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <MapPin size={14} color="#6B7280" />
                            <Text style={styles.infoText}>{item.location || "Sem localização"}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>🌾 Área total:</Text>
                            <Text style={[styles.infoText, styles.value]}>{item.totalArea || 0} ha</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <User size={14} color="#6B7280" />
                            <Text style={styles.infoText}>{item.manager || "Sem responsável"}</Text>
                        </View>

                        <View style={styles.actions}>
                            <Pressable
                                onPress={() => onEdit(item)}
                                style={[styles.btn, styles.editBtn]}
                                accessibilityLabel="Editar"
                            >
                                <Edit size={16} color="#374151" />
                                <Text style={styles.btnText}>Editar</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => item.id && onDelete(item.id)}
                                style={[styles.btn, styles.deleteBtn]}
                                accessibilityLabel="Excluir"
                            >
                                <Trash2 size={16} color="#DC2626" />
                                <Text style={[styles.btnText, { color: "#DC2626" }]}>Excluir</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        paddingVertical: 8,
        gap: 12,
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 14,
        marginHorizontal: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeText: {
        fontWeight: "600",
        fontSize: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },
    infoText: {
        color: "#374151",
        fontSize: 13,
    },
    value: {
        fontWeight: "600",
        color: "#111827",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 10,
    },
    btn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        borderWidth: 1,
    },
    editBtn: {
        borderColor: "#D1D5DB",
    },
    deleteBtn: {
        borderColor: "#FCA5A5",
    },
    btnText: {
        fontWeight: "600",
        color: "#374151",
        fontSize: 12,
    },
    empty: {
        textAlign: "center",
        color: "#6B7280",
        marginTop: 24,
    },
});
