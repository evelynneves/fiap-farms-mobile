import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Item } from "../../domain/entities/Item";
import type { Sale } from "../../domain/entities/Sale";
import { AlertMessage } from "./AlertMessage";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sale: Sale, isEdit: boolean) => void;
    products: Item[];
    editingSale?: Sale | null;
}

const formatCurrency = (v: number) =>
    (typeof Intl !== "undefined"
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
        : { format: (x: number) => `R$ ${x.toFixed(2)}` }
    ).format(v);

const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function SaleFormModal({ isOpen, onClose, onSave, products, editingSale }: Props) {
    const [form, setForm] = useState({
        productId: "",
        quantity: "",
        salePrice: "",
        date: "",
    });
    const [error, setError] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [pickerDate, setPickerDate] = useState<Date>(new Date());

    const reset = () => {
        setForm({ productId: "", quantity: "", salePrice: "", date: "" });
        setError("");
        setPickerDate(new Date());
        setShowPicker(false);
    };

    useEffect(() => {
        if (editingSale) {
            setForm({
                productId: editingSale.productId,
                quantity: String(editingSale.quantity),
                salePrice: String(editingSale.salePrice),
                date: editingSale.date,
            });
            const d = new Date(editingSale.date);
            if (!isNaN(d.valueOf())) setPickerDate(d);
        } else {
            reset();
        }
    }, [editingSale, isOpen]);

    const selectedProduct = useMemo(
        () => products.find((p) => p.id === form.productId) ?? null,
        [products, form.productId]
    );

    const totalValue = useMemo(() => {
        const q = parseFloat(form.quantity);
        const p = parseFloat(form.salePrice);
        if (!Number.isFinite(q) || !Number.isFinite(p)) return 0;
        return q * p;
    }, [form.quantity, form.salePrice]);

    const submit = () => {
        setError("");
        if (!form.productId || !form.quantity || !form.salePrice || !form.date) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        const product = selectedProduct;
        if (!product) {
            setError("Produto não encontrado.");
            return;
        }
        const quantity = Number(form.quantity);
        const salePrice = Number(form.salePrice);
        if (!Number.isInteger(quantity) || quantity <= 0) {
            setError("A quantidade vendida deve ser um número inteiro maior que zero.");
            return;
        }
        const sale: Sale = {
            id: editingSale ? editingSale.id : "",
            productId: product.id,
            productName: product.name,
            farmName: `Fazenda ${product.farm}`,
            quantity,
            salePrice,
            totalValue: quantity * salePrice,
            date: form.date,
        };
        onSave(sale, !!editingSale);
        onClose();
        reset();
    };

    const openDate = () => setShowPicker(true);
    const onDateChange = (_: any, date?: Date) => {
        if (Platform.OS !== "ios") setShowPicker(false);
        if (!date) return;
        setPickerDate(date);
        setForm((f) => ({ ...f, date: toISO(date) }));
    };

    return (
        <Modal visible={isOpen} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{editingSale ? "Editar Venda" : "Registrar Nova Venda"}</Text>
                            <Text style={styles.subtitle}>
                                {editingSale ? "Atualize os dados da venda" : "Preencha os dados da venda"}
                            </Text>
                        </View>
                        <Pressable onPress={onClose} accessibilityLabel="Fechar">
                            <Text style={styles.close}>×</Text>
                        </Pressable>
                    </View>

                    {!!error && <AlertMessage message={error} />}

                    {/* Produto */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Produto *</Text>
                        <View style={styles.pickerWrap}>
                            <Picker
                                selectedValue={form.productId}
                                onValueChange={(v) => setForm((f) => ({ ...f, productId: String(v) }))}
                            >
                                <Picker.Item label="Selecione o produto" value="" />
                                {products.map((p) => (
                                    <Picker.Item key={p.id} label={`${p.name} - Fazenda ${p.farm}`} value={p.id} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {selectedProduct && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLine}>
                                <Text style={styles.infoStrong}>Fazenda ID: </Text>
                                {selectedProduct.farm}
                            </Text>
                            <Text style={styles.infoLine}>
                                <Text style={styles.infoStrong}>Preço de custo: </Text>
                                {formatCurrency(selectedProduct.costPrice)}
                            </Text>
                            <Text style={styles.infoLine}>
                                <Text style={styles.infoStrong}>Estoque disponível: </Text>
                                {selectedProduct.quantity} {selectedProduct.unit}
                            </Text>
                        </View>
                    )}

                    {/* Quantidade */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Quantidade Vendida *</Text>
                        <TextInput
                            value={form.quantity}
                            onChangeText={(t) => setForm((f) => ({ ...f, quantity: t }))}
                            placeholder="500"
                            keyboardType="number-pad"
                            style={styles.input}
                        />
                    </View>

                    {/* Preço de venda */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Preço de Venda (R$) *</Text>
                        <TextInput
                            value={form.salePrice}
                            onChangeText={(t) => setForm((f) => ({ ...f, salePrice: t }))}
                            placeholder="18.50"
                            keyboardType="decimal-pad"
                            style={styles.input}
                        />
                    </View>

                    {/* Data */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Data da Venda *</Text>
                        <Pressable onPress={openDate} style={styles.input}>
                            <Text style={{ color: form.date ? "#111827" : "#9CA3AF" }}>
                                {form.date || "Selecionar data"}
                            </Text>
                        </Pressable>
                        {showPicker && (
                            <DateTimePicker
                                value={pickerDate}
                                mode="date"
                                display={Platform.OS === "ios" ? "inline" : "default"}
                                onChange={onDateChange}
                            />
                        )}
                    </View>

                    {form.quantity && form.salePrice ? (
                        <View style={styles.totalBox}>
                            <Text style={styles.totalText}>Valor Total: {formatCurrency(totalValue)}</Text>
                        </View>
                    ) : null}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={submit}>
                            <Text style={styles.btnPrimaryText}>{editingSale ? "Atualizar" : "Registrar"}</Text>
                        </Pressable>
                        <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onClose}>
                            <Text style={styles.btnSecondaryText}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
    modal: { backgroundColor: "#fff", borderRadius: 10, padding: 16, gap: 12 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 18, fontWeight: "700", color: "#111827" },
    subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
    close: { fontSize: 24, color: "#111827" },

    field: { gap: 6 },
    label: { fontSize: 13, color: "#374151", fontWeight: "500" },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: "#bbf7d0",
        borderRadius: 8,
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    pickerWrap: {
        borderWidth: 1,
        borderColor: "#bbf7d0",
        borderRadius: 8,
        overflow: "hidden",
    },

    infoBox: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
        borderRadius: 8,
        gap: 4,
    },
    infoLine: { color: "#374151", fontSize: 14 },
    infoStrong: { fontWeight: "600" },

    totalBox: {
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        padding: 10,
    },
    totalText: { fontWeight: "700", color: "#111827" },

    actions: { flexDirection: "row", gap: 10, marginTop: 4 },
    btn: {
        flex: 1,
        height: 44,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    btnPrimary: { backgroundColor: "#10B981" },
    btnPrimaryText: { color: "#fff", fontWeight: "700" },
    btnSecondary: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB" },
    btnSecondaryText: { color: "#111827", fontWeight: "600" },
});
