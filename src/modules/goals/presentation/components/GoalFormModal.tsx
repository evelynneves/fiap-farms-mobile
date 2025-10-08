/******************************************************************************
 *                                                                             *
 * Creation Date : 06/10/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 ******************************************************************************/

import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import type { Goal } from "../../domain/entities/Goal";
import type { Item } from "../../domain/entities/Item";
import { AlertMessage } from "./AlertMessage";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Goal, isEdit: boolean) => void;
    editingGoal?: Goal | null;
    products: Item[];
    goals: Goal[];
}

const TYPES: { key: "sales" | "production"; label: string }[] = [
    { key: "sales", label: "Vendas" },
    { key: "production", label: "Produção" },
];

export function GoalFormModal({ isOpen, onClose, onSave, editingGoal, products, goals }: Props) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<"sales" | "production" | "">("");
    const [productId, setProductId] = useState("");
    const [target, setTarget] = useState("");
    const [unit, setUnit] = useState("");
    const [startDate, setStartDate] = useState("");
    const [deadline, setDeadline] = useState("");
    const [description, setDescription] = useState("");
    const [formError, setFormError] = useState("");

    const [pickTypeOpen, setPickTypeOpen] = useState(false);
    const [pickProductOpen, setPickProductOpen] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
    const [pickerStartDate, setPickerStartDate] = useState<Date>(new Date());
    const [pickerDeadline, setPickerDeadline] = useState<Date>(new Date());

    const toISO = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const openStartPicker = () => setShowStartPicker(true);
    const openDeadlinePicker = () => setShowDeadlinePicker(true);

    const onStartDateChange = (_: any, date?: Date) => {
        if (Platform.OS !== "ios") setShowStartPicker(false);
        if (!date) return;
        setPickerStartDate(date);
        setStartDate(toISO(date));
    };

    const onDeadlineChange = (_: any, date?: Date) => {
        if (Platform.OS !== "ios") setShowDeadlinePicker(false);
        if (!date) return;
        setPickerDeadline(date);
        setDeadline(toISO(date));
    };

    useEffect(() => {
        if (editingGoal) {
            setTitle(editingGoal.title);
            setType(editingGoal.type);
            setProductId(editingGoal.productId || "");
            setTarget(String(editingGoal.target));
            setUnit(editingGoal.unit);
            setStartDate(editingGoal.startDate ?? "");
            setDeadline(editingGoal.deadline);
            setDescription(editingGoal.description ?? "");
            setFormError("");
        } else {
            resetForm();
        }
    }, [editingGoal]);

    useEffect(() => {
        if (productId) {
            const selected = products.find((p) => p.id === productId);
            setUnit(selected?.unit || "");
        } else {
            setUnit("");
        }
    }, [productId, products]);

    const selectableProducts = useMemo(() => {
        return products.filter((p) => {
            const exists = goals.some(
                (g) => g.productId === p.id && g.type === type && (!editingGoal || g.id !== editingGoal.id)
            );
            return !exists;
        });
    }, [products, goals, type, editingGoal]);

    function resetForm() {
        setTitle("");
        setType("");
        setProductId("");
        setTarget("");
        setUnit("");
        setStartDate("");
        setDeadline("");
        setDescription("");
        setFormError("");
    }

    function handleSubmit() {
        if (!title || !type || !productId || !target || !unit || !deadline || !startDate) {
            setFormError("Preencha todos os campos obrigatórios.");
            return;
        }

        const alreadyExists = goals.some(
            (g) => g.productId === productId && g.type === type && (!editingGoal || g.id !== editingGoal.id)
        );
        if (alreadyExists) {
            setFormError("Já existe uma meta para este produto e tipo.");
            return;
        }

        const selected = products.find((p) => p.id === productId);
        const newGoal: Goal = {
            id: editingGoal ? editingGoal.id : "",
            title: title.trim(),
            type: type as "sales" | "production",
            productId,
            productName: selected?.name || "",
            target: Number(target),
            current: editingGoal ? editingGoal.current : 0,
            unit,
            startDate,
            deadline,
            status: editingGoal ? editingGoal.status : "active",
            description: description.trim(),
            createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        onSave(newGoal, !!editingGoal);
        onClose();
        resetForm();
    }

    if (!isOpen) return null;

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{editingGoal ? "Editar Meta" : "Criar Nova Meta"}</Text>
                        <Text style={styles.headerSub}>
                            {editingGoal
                                ? "Atualize as informações da meta"
                                : "Defina uma nova meta de vendas ou produção"}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeTxt}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {!!formError && <AlertMessage tone="error" message={formError} />}

                    <View style={styles.field}>
                        <Text style={styles.label}>Título da Meta *</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Ex: Meta de Vendas Q1"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Tipo *</Text>
                            <Pressable style={styles.select} onPress={() => setPickTypeOpen(true)}>
                                <Text style={styles.selectText}>
                                    {type ? (type === "sales" ? "Vendas" : "Produção") : "Selecione o tipo"}
                                </Text>
                            </Pressable>
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Produto *</Text>
                            <Pressable
                                style={[styles.select, !type && styles.selectDisabled]}
                                onPress={() => type && setPickProductOpen(true)}
                            >
                                <Text style={styles.selectText}>
                                    {!type
                                        ? "Escolha um tipo primeiro"
                                        : productId
                                        ? products.find((p) => p.id === productId)?.name
                                        : "Selecione o produto"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Meta *</Text>
                            <TextInput
                                keyboardType={Platform.select({ ios: "decimal-pad", android: "numeric" })}
                                value={target}
                                onChangeText={setTarget}
                                placeholder="1000"
                                style={styles.input}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Unidade *</Text>
                            <TextInput value={unit} editable={false} style={[styles.input, styles.inputDisabled]} />
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Início da Meta *</Text>
                        <Pressable onPress={openStartPicker} style={styles.input}>
                            <Text style={{ color: startDate ? "#111827" : "#9CA3AF" }}>
                                {startDate || "Selecionar data"}
                            </Text>
                        </Pressable>

                        {showStartPicker && (
                            <DateTimePicker
                                value={pickerStartDate}
                                mode="date"
                                display={Platform.OS === "ios" ? "inline" : "default"}
                                onChange={onStartDateChange}
                            />
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Prazo *</Text>
                        <Pressable onPress={openDeadlinePicker} style={styles.input}>
                            <Text style={{ color: deadline ? "#111827" : "#9CA3AF" }}>
                                {deadline || "Selecionar data"}
                            </Text>
                        </Pressable>

                        {showDeadlinePicker && (
                            <DateTimePicker
                                value={pickerDeadline}
                                mode="date"
                                display={Platform.OS === "ios" ? "inline" : "default"}
                                onChange={onDeadlineChange}
                            />
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Descrição da meta (opcional)"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSubmit}>
                            <Text style={styles.btnPrimaryTxt}>{editingGoal ? "Atualizar" : "Criar Meta"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onClose}>
                            <Text style={styles.btnSecondaryTxt}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Modal visible={pickTypeOpen} transparent animationType="fade">
                <Pressable style={styles.overlay} onPress={() => setPickTypeOpen(false)}>
                    <View style={styles.pickerSheet}>
                        {TYPES.map((t) => (
                            <TouchableOpacity
                                key={t.key}
                                style={styles.pickerItem}
                                onPress={() => {
                                    setType(t.key);
                                    setPickTypeOpen(false);
                                }}
                            >
                                <Text style={styles.pickerItemTxt}>{t.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            <Modal visible={pickProductOpen} transparent animationType="fade">
                <Pressable style={styles.overlay} onPress={() => setPickProductOpen(false)}>
                    <View style={[styles.pickerSheet, { maxHeight: "60%" }]}>
                        <FlatList
                            data={selectableProducts}
                            keyExtractor={(it) => it.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setProductId(item.id);
                                        setPickProductOpen(false);
                                    }}
                                >
                                    <Text style={styles.pickerItemTxt}>
                                        {item.name} - {item.farm}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyTxt}>Nenhum produto disponível</Text>}
                        />
                    </View>
                </Pressable>
            </Modal>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    container: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        maxWidth: 520,
        position: "relative",
        gap: 15,
    },
    header: { marginBottom: 12 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
    headerSub: { fontSize: 14, color: "#6B7280", marginTop: 2 },
    closeBtn: { position: "absolute", right: 12, top: 12, padding: 4 },
    closeTxt: { fontSize: 20, color: "#111827" },

    field: { gap: 6 },
    label: { fontSize: 13, color: "#374151", fontWeight: "500" },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: "#BBF7D0",
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: "#FFF",
        justifyContent: "center",
    },
    inputDisabled: { backgroundColor: "#F3F4F6", color: "#6B7280" },

    row: { flexDirection: "row", gap: 12 },
    col: { flex: 1 },

    select: {
        height: 44,
        borderWidth: 1,
        borderColor: "#BBF7D0",
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 12,
        backgroundColor: "#FFF",
    },
    selectDisabled: { backgroundColor: "#F3F4F6" },
    selectText: { color: "#111827" },

    actions: { flexDirection: "row", gap: 12, marginTop: 12 },
    btn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 8 },
    btnPrimary: { backgroundColor: "#16A34A" },
    btnPrimaryTxt: { color: "#FFF", fontWeight: "800" },
    btnSecondary: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#D1D5DB" },
    btnSecondaryTxt: { color: "#111827", fontWeight: "700" },

    pickerSheet: { backgroundColor: "#FFF", borderRadius: 12, padding: 8, width: "100%", maxWidth: 520 },
    pickerItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E7EB",
    },
    pickerItemTxt: { fontWeight: "600", color: "#111827" },
    emptyTxt: { textAlign: "center", color: "#6B7280", paddingVertical: 12 },
});
