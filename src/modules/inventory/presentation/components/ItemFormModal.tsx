import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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

const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const formatDateBR = (iso?: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
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
    const [picker, setPicker] = useState<null | {
        key: "category" | "farm" | "unit";
        options: string[];
    }>(null);
    const [formError, setFormError] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerEntryId, setPickerEntryId] = useState<string | null>(null);
    const [pickerDate, setPickerDate] = useState<Date>(new Date());

    const resetForm = () => {
        setForm({
            name: "",
            category: "",
            farm: "",
            minStock: "",
            unit: "",
            costPrice: "",
        });
        setEntries([]);
        setFormError("");
        setShowDatePicker(false);
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
            setFormError("");
        } else {
            resetForm();
        }
    }, [editingItem]);

    if (!isOpen) return null;

    const addEntry = () => {
        setEntries((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                date: toISO(new Date()),
                quantity: 0,
                showPicker: false,
            },
        ]);
    };

    const openDate = (entryId: string, current?: string) => {
        setPickerEntryId(entryId);
        setPickerDate(current ? new Date(current) : new Date());
        setShowDatePicker(true);
    };

    const onDateChange = (_: any, date?: Date) => {
        if (Platform.OS !== "ios") setShowDatePicker(false);
        if (!date || !pickerEntryId) return;
        const iso = toISO(date);
        setEntries((arr) => arr.map((en) => (en.id === pickerEntryId ? { ...en, date: iso } : en)));
    };

    const requiredFilled =
        form.name.trim().length > 0 &&
        form.category.trim().length > 0 &&
        form.farm.trim().length > 0 &&
        form.unit.trim().length > 0 &&
        form.minStock.trim().length > 0 &&
        form.costPrice.trim().length > 0;

    const minStockNum = Number(form.minStock);
    const costPriceNum = Number(form.costPrice);
    const numbersOk =
        !Number.isNaN(minStockNum) && !Number.isNaN(costPriceNum) && minStockNum >= 0 && costPriceNum >= 0;

    const canSubmit = requiredFilled && numbersOk;

    const submit = async () => {
        if (!canSubmit) {
            setFormError(
                !requiredFilled
                    ? "Preencha todos os campos obrigatórios (*)."
                    : "Verifique os valores numéricos (estoque mínimo e preço de custo)."
            );
            return;
        }

        const totalQuantity = entries.reduce((sum, e) => sum + (Number(e.quantity) || 0), 0);
        const newItem: Item = {
            ...(editingItem?.id ? { id: editingItem.id } : {}),
            name: form.name.trim(),
            category: form.category,
            farm: form.farm,
            quantity: totalQuantity,
            minStock: minStockNum || 0,
            unit: form.unit,
            costPrice: costPriceNum || 0,
            lastUpdated: toISO(new Date()),
            entries,
            sales: editingItem?.sales ?? [],
            hasRelatedGoal: editingItem?.hasRelatedGoal ?? false,
        };
        await onSave(newItem, !!editingItem);
        handleClose();
    };

    const openPicker = (key: "category" | "farm" | "unit") => {
        setPicker({
            key,
            options: key === "category" ? categories : key === "farm" ? farms : units,
        });
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
                                maxLength={40}
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

                            {!!formError && <Text style={styles.formError}>{formError}</Text>}
                        </Section>

                        <Section title="Entradas de Produção">
                            <Pressable onPress={addEntry} style={[styles.btn, styles.btnPrimary, styles.btnLarge]}>
                                <Text style={styles.btnPrimaryTxt}>+ Adicionar Entrada</Text>
                            </Pressable>

                            <View style={styles.table}>
                                <View style={styles.tHead}>
                                    <Text style={[styles.th, { flex: 1 }]}>Data</Text>
                                    <Text style={[styles.th, { width: 120, textAlign: "right" }]}>Quantidade</Text>
                                </View>
                                {entries.map((e) => (
                                    <View key={e.id} style={styles.tRow}>
                                        <Pressable
                                            onPress={() => openDate(e.id, e.date)}
                                            style={[styles.input, { flex: 1, justifyContent: "center" }]}
                                        >
                                            <Text style={{ color: e.date ? "#111827" : "#9CA3AF" }}>
                                                {e.date ? formatDateBR(e.date) : "Selecionar data"}
                                            </Text>
                                        </Pressable>

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

                        {showDatePicker && (
                            <DateTimePicker
                                value={pickerDate}
                                mode="date"
                                display={Platform.OS === "ios" ? "inline" : "default"}
                                onChange={onDateChange}
                            />
                        )}

                        <View style={styles.actionsRow}>
                            <Pressable
                                onPress={submit}
                                disabled={!canSubmit}
                                style={[styles.btn, styles.btnPrimary, !canSubmit && styles.btnDisabled]}
                            >
                                <Text style={styles.btnPrimaryTxt}>Salvar</Text>
                            </Pressable>
                            <Pressable onPress={handleClose} style={[styles.btn, styles.btnSecondary]}>
                                <Text style={styles.btnSecondaryTxt}>Cancelar</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>

            <Modal visible={!!picker} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
                <Pressable style={styles.pOverlay} onPress={() => setPicker(null)}>
                    <Pressable style={styles.pContainer} onPress={(e) => e.stopPropagation()}>
                        {picker?.options?.length ? (
                            <FlatList
                                data={picker.options}
                                keyExtractor={(v) => v}
                                renderItem={({ item }) => (
                                    <Pressable onPress={() => setPick(item)} style={styles.pItem}>
                                        <Text style={styles.pItemTxt}>{item}</Text>
                                    </Pressable>
                                )}
                                ItemSeparatorComponent={() => <View style={styles.pSeparator} />}
                                style={{ maxHeight: 300 }}
                            />
                        ) : (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyMsg}>
                                    {picker?.key === "category"
                                        ? "Nenhuma categoria cadastrada."
                                        : picker?.key === "farm"
                                        ? "Nenhuma fazenda cadastrada."
                                        : "Nenhuma unidade cadastrada."}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
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
    formError: {
        marginTop: 6,
        color: "#B91C1C",
        backgroundColor: "#FEF2F2",
        borderColor: "#FCA5A5",
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        fontSize: 13,
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
    btnLarge: {
        alignSelf: "stretch",
        width: "100%",
        paddingHorizontal: 16,
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.5 },

    pOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
    pContainer: { backgroundColor: "#FFF", width: "90%", maxWidth: 360, borderRadius: 10, padding: 12 },
    pItem: { paddingVertical: 12, paddingHorizontal: 8 },
    pItemTxt: { fontSize: 16, color: "#111827" },
    pSeparator: { height: 1, backgroundColor: "#E5E7EB" },
    emptyBox: { paddingVertical: 24, alignItems: "center", justifyContent: "center" },
    emptyMsg: {
        textAlign: "center",
        color: "#6B7280",
        fontSize: 15,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingVertical: 20,
        paddingHorizontal: 10,
        width: "100%",
    },
});
