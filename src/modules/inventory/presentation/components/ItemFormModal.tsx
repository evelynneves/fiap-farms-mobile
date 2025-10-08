import React, { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Item, StockEntry } from "../../domain/entities/Item";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Item, isEdit: boolean) => Promise<void> | void;
    editingItem?: Item | null;
    categories: string[];
    farms: string[];
    units: string[];
};

export function ItemFormModal({ isOpen, onClose, onSave, editingItem, categories, farms, units }: Props) {
    const [form, setForm] = useState({
        name: "",
        category: "",
        farm: "",
        minStock: "",
        unit: "",
        costPrice: "",
    });
    const [entries, setEntries] = useState<StockEntry[]>([]);
    const [picker, setPicker] = useState<null | { key: "category" | "farm" | "unit"; options: string[] }>(null);

    const resetForm = () => {
        setForm({ name: "", category: "", farm: "", minStock: "", unit: "", costPrice: "" });
        setEntries([]);
    };
    const handleClose = () => {
        resetForm();
        onClose();
    };

    useEffect(() => {
        if (editingItem) {
            setForm({
                name: editingItem.name,
                category: editingItem.category,
                farm: editingItem.farm,
                minStock: String(editingItem.minStock),
                unit: editingItem.unit,
                costPrice: String(editingItem.costPrice),
            });
            setEntries(editingItem.entries ?? []);
        } else {
            resetForm();
        }
    }, [editingItem]);

    if (!isOpen) return null;

    const addEntry = () => {
        setEntries((prev) => [
            ...prev,
            { id: Date.now().toString(), date: new Date().toISOString().split("T")[0], quantity: 0 },
        ]);
    };

    const submit = async () => {
        const totalQuantity = entries.reduce((sum, e) => sum + (Number(e.quantity) || 0), 0);
        const newItem: Item = {
            ...(editingItem?.id ? { id: editingItem.id } : {}),
            name: form.name.trim(),
            category: form.category,
            farm: form.farm,
            quantity: totalQuantity,
            minStock: Number(form.minStock) || 0,
            unit: form.unit,
            costPrice: Number(form.costPrice) || 0,
            lastUpdated: new Date().toISOString().split("T")[0],
            entries,
            sales: editingItem?.sales ?? [],
            hasRelatedGoal: editingItem?.hasRelatedGoal ?? false,
        };
        await onSave(newItem, !!editingItem);
        handleClose();
    };

    const openPicker = (key: "category" | "farm" | "unit") => {
        setPicker({ key, options: key === "category" ? categories : key === "farm" ? farms : units });
    };

    const setPick = (value: string) => {
        if (!picker) return;
        setForm((f) => ({ ...f, [picker.key]: value }));
        setPicker(null);
    };

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.h2}>{editingItem ? "Gerenciar Item" : "Adicionar Novo Item"}</Text>
                        <Pressable onPress={handleClose}>
                            <Text style={styles.close}>×</Text>
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                        <Section title="Dados do Item">
                            <LabeledInput
                                label="Nome do Item *"
                                value={form.name}
                                onChangeText={(v) => setForm({ ...form, name: v })}
                            />
                            <Selector
                                label="Categoria *"
                                value={form.category}
                                onPress={() => openPicker("category")}
                                placeholder="Selecione"
                            />
                            <Selector
                                label="Fazenda *"
                                value={form.farm}
                                onPress={() => openPicker("farm")}
                                placeholder="Selecione"
                            />
                            <LabeledInput
                                label="Estoque Mínimo *"
                                value={form.minStock}
                                keyboardType="numeric"
                                onChangeText={(v) => setForm({ ...form, minStock: v })}
                            />
                            <Selector
                                label="Unidade *"
                                value={form.unit}
                                onPress={() => openPicker("unit")}
                                placeholder="Selecione"
                            />
                            <LabeledInput
                                label="Preço de Custo (R$) *"
                                value={form.costPrice}
                                keyboardType="decimal-pad"
                                onChangeText={(v) => setForm({ ...form, costPrice: v })}
                            />
                        </Section>

                        <Section title="Entradas de Produção">
                            <Pressable onPress={addEntry} style={[styles.btn, styles.btnPrimary, styles.btnLarge]}>
                                <Text style={styles.btnPrimaryTxt}>+ Adicionar Entrada</Text>
                            </Pressable>

                            <View style={styles.table}>
                                <View style={styles.tHead}>
                                    <Text style={[styles.th, { flex: 1 }]}>Data (YYYY-MM-DD)</Text>
                                    <Text style={[styles.th, { width: 120, textAlign: "right" }]}>Quantidade</Text>
                                </View>
                                {entries.map((e) => (
                                    <View key={e.id} style={styles.tRow}>
                                        <TextInput
                                            value={e.date}
                                            onChangeText={(v) =>
                                                setEntries((arr) =>
                                                    arr.map((en) => (en.id === e.id ? { ...en, date: v } : en))
                                                )
                                            }
                                            placeholder="2025-04-16"
                                            style={[styles.input, { flex: 1 }]}
                                        />
                                        <TextInput
                                            value={String(e.quantity)}
                                            onChangeText={(v) =>
                                                setEntries((arr) =>
                                                    arr.map((en) =>
                                                        en.id === e.id ? { ...en, quantity: Number(v) || 0 } : en
                                                    )
                                                )
                                            }
                                            keyboardType="numeric"
                                            style={[styles.input, { width: 120, textAlign: "right" }]}
                                        />
                                    </View>
                                ))}
                            </View>
                        </Section>

                        {editingItem?.sales && (
                            <Section title="Saídas (Vendas)">
                                {editingItem.sales.length ? (
                                    <View style={styles.table}>
                                        <View style={styles.tHead}>
                                            <Text style={[styles.th, { flex: 1 }]}>Data</Text>
                                            <Text style={[styles.th, { width: 120, textAlign: "right" }]}>
                                                Quantidade
                                            </Text>
                                        </View>
                                        {editingItem.sales.map((s) => (
                                            <View key={s.id} style={styles.tRow}>
                                                <Text style={[styles.td, { flex: 1 }]}>{s.date}</Text>
                                                <Text style={[styles.td, { width: 120, textAlign: "right" }]}>
                                                    -{s.quantity}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={styles.emptyInfo}>
                                        Ainda não existem vendas cadastradas para este item.
                                    </Text>
                                )}
                            </Section>
                        )}

                        <View style={styles.actionsRow}>
                            <Pressable onPress={submit} style={[styles.btn, styles.btnPrimary]}>
                                <Text style={styles.btnPrimaryTxt}>Salvar</Text>
                            </Pressable>
                            <Pressable onPress={handleClose} style={[styles.btn, styles.btnSecondary]}>
                                <Text style={styles.btnSecondaryTxt}>Cancelar</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Picker simples */}
            <Modal visible={!!picker} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
                <View style={styles.pOverlay}>
                    <View style={styles.pContainer}>
                        <FlatList
                            data={picker?.options ?? []}
                            keyExtractor={(v) => v}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => setPick(item)} style={styles.pItem}>
                                    <Text style={styles.pItemTxt}>{item}</Text>
                                </Pressable>
                            )}
                            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />}
                        />
                        <Pressable
                            onPress={() => setPicker(null)}
                            style={[styles.btn, styles.btnSecondary, { marginTop: 12 }]}
                        >
                            <Text style={styles.btnSecondaryTxt}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

function LabeledInput({ label, ...rest }: { label: string } & React.ComponentProps<typeof TextInput>) {
    return (
        <View style={{ gap: 6 }}>
            <Text style={styles.label}>{label}</Text>
            <TextInput {...rest} style={styles.input} />
        </View>
    );
}

function Selector({
    label,
    value,
    onPress,
    placeholder,
}: {
    label: string;
    value: string;
    onPress: () => void;
    placeholder?: string;
}) {
    return (
        <View style={{ gap: 6 }}>
            <Text style={styles.label}>{label}</Text>
            <Pressable onPress={onPress} style={styles.input}>
                <Text style={{ color: value ? "#111827" : "#9CA3AF" }}>{value || placeholder || "Selecionar"}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
    container: {
        width: "92%",
        maxWidth: 520,
        maxHeight: "90%",
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 16,
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    h2: { fontSize: 18, fontWeight: "700" },
    close: { fontSize: 24, color: "#6B7280", paddingHorizontal: 8 },

    section: { backgroundColor: "#F9FAFB", padding: 16, borderRadius: 8, gap: 12, marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
    label: { fontSize: 13, fontWeight: "600", color: "#374151" },
    input: {
        borderWidth: 1,
        borderColor: "#BBF7D0",
        backgroundColor: "#FFF",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },

    table: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, overflow: "hidden" },
    tHead: { flexDirection: "row", backgroundColor: "#F9FAFB", paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    th: { fontSize: 12, fontWeight: "700", color: "#4B5563" },
    tRow: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    td: { fontSize: 13, color: "#374151" },

    emptyInfo: {
        fontSize: 13,
        color: "#6B7280",
        padding: 12,
        backgroundColor: "#F9FAFB",
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 6,
    },

    actionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
    btn: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    btnPrimary: { backgroundColor: "#16A34A" },
    btnPrimaryTxt: { color: "#FFF", fontWeight: "700" },
    btnSecondary: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#D1D5DB" },
    btnSecondaryTxt: { color: "#111827", fontWeight: "700" },
    btnLarge: { alignSelf: "flex-start", paddingHorizontal: 16 },

    pOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
    pContainer: { backgroundColor: "#FFF", width: "90%", maxWidth: 360, borderRadius: 10, padding: 12 },
    pItem: { paddingVertical: 12, paddingHorizontal: 8 },
    pItemTxt: { fontSize: 16, color: "#111827" },
});
