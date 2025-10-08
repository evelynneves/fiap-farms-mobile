import { Edit, Trash2 } from "lucide-react-native";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Category } from "../../domain/entities/Category";

type Props = { categories: Category[]; onEdit: (c: Category) => void; onDelete: (id: string) => void };

export function CategoryList({ categories, onEdit, onDelete }: Props) {
    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={[styles.head, { flex: 1 }]}>Nome da Categoria</Text>
                <Text style={[styles.head, styles.center, { width: 92 }]}>Ações</Text>
            </View>

            <FlatList
                data={categories}
                keyExtractor={(it) => it.id}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={[styles.cell, { flex: 1 }]}>{item.name}</Text>
                        <View style={[styles.cell, styles.actions]}>
                            <Pressable onPress={() => onEdit(item)} style={styles.iconBtn} accessibilityLabel="Editar">
                                <Edit size={16} color="#374151" />
                            </Pressable>
                            <Pressable
                                onPress={() => onDelete(item.id)}
                                style={[styles.iconBtn, { color: "#DC2626" }]}
                                accessibilityLabel="Excluir"
                            >
                                <Trash2 size={16} color="#DC2626" />
                            </Pressable>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Nenhuma categoria cadastrada.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    headerRow: { flexDirection: "row", backgroundColor: "#F9FAFB", paddingHorizontal: 16, paddingVertical: 12 },
    head: { color: "#4B5563", fontWeight: "700" },
    center: { textAlign: "center" },
    row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
    sep: { height: 1, backgroundColor: "#E5E7EB" },
    cell: { color: "#374151" },
    actions: { width: 92, flexDirection: "row", justifyContent: "center", gap: 8 },
    iconBtn: { padding: 6 },
    empty: { padding: 16, color: "#6B7280" },
});
