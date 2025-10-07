import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Farm } from "../../domain/entities/Farm";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (farm: Farm, isEdit: boolean) => void;
    editingFarm?: Farm | null;
};

const TYPES = ["Grãos", "Café", "Frutas", "Hortaliças", "Leguminosas"];

export function FarmFormModal({ isOpen, onClose, onSave, editingFarm }: Props) {
    const initial: Farm = { id: "", name: "", location: "", totalArea: 0, productionType: "", manager: "" };
    const [form, setForm] = useState<Farm>(initial);

    useEffect(() => {
        setForm(editingFarm ?? initial);
    }, [editingFarm, isOpen]);

    const submit = () => {
        onSave(form, !!editingFarm);
        setForm(initial);
        onClose();
    };

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ width: "100%" }}
                >
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Text style={styles.h2}>{editingFarm ? "Editar Fazenda" : "Cadastrar Nova Fazenda"}</Text>
                            <Text style={styles.sub}>
                                {editingFarm
                                    ? "Atualize as informações da fazenda"
                                    : "Preencha os dados da nova fazenda"}
                            </Text>
                            <Pressable onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeTxt}>×</Text>
                            </Pressable>
                        </View>

                        <ScrollView contentContainerStyle={{ gap: 12 }} keyboardShouldPersistTaps="handled">
                            <LabeledInput label="Nome da Fazenda *">
                                <TextInput
                                    placeholder="Ex: Fazenda São João"
                                    value={form.name}
                                    onChangeText={(v) => setForm({ ...form, name: v })}
                                    style={styles.input}
                                />
                            </LabeledInput>

                            <LabeledInput label="Localização *">
                                <TextInput
                                    placeholder="Ex: Ribeirão Preto, SP"
                                    value={form.location}
                                    onChangeText={(v) => setForm({ ...form, location: v })}
                                    style={styles.input}
                                />
                            </LabeledInput>

                            <LabeledInput label="Área Total (ha) *">
                                <TextInput
                                    placeholder="120"
                                    keyboardType="numeric"
                                    value={String(form.totalArea ?? 0)}
                                    onChangeText={(v) => setForm({ ...form, totalArea: Number(v) || 0 })}
                                    style={styles.input}
                                />
                            </LabeledInput>

                            <View style={{ gap: 8 }}>
                                <Text style={styles.label}>Tipo de Produção *</Text>
                                <View style={styles.chipsRow}>
                                    {TYPES.map((t) => {
                                        const active = form.productionType === t;
                                        return (
                                            <Pressable
                                                key={t}
                                                onPress={() => setForm({ ...form, productionType: t })}
                                                style={[styles.chip, active && styles.chipActive]}
                                            >
                                                <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
                                                    {t}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <LabeledInput label="Responsável/Gestor *">
                                <TextInput
                                    placeholder="Ex: Carlos Silva"
                                    value={form.manager}
                                    onChangeText={(v) => setForm({ ...form, manager: v })}
                                    style={styles.input}
                                />
                            </LabeledInput>

                            <View style={styles.actions}>
                                <Pressable onPress={submit} style={[styles.btn, styles.btnPrimary]}>
                                    <Text style={styles.btnPrimaryTxt}>{editingFarm ? "Atualizar" : "Cadastrar"}</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        setForm(initial);
                                        onClose();
                                    }}
                                    style={[styles.btn, styles.btnSecondary]}
                                >
                                    <Text style={styles.btnSecondaryTxt}>Cancelar</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

function LabeledInput({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View style={{ gap: 6 }}>
            <Text style={styles.label}>{label}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    container: {
        backgroundColor: "#FFF",
        width: "100%",
        maxWidth: 500,
        borderRadius: 8,
        padding: 16,
        maxHeight: "90%",
    },
    header: { marginBottom: 12 },
    h2: { fontSize: 20, fontWeight: "700", color: "#111827" },
    sub: { marginTop: 4, color: "#6B7280" },
    closeBtn: { position: "absolute", right: 8, top: 8, padding: 4 },
    closeTxt: { fontSize: 22, color: "#111827" },

    label: { fontSize: 14, fontWeight: "600", color: "#374151" },
    input: { height: 44, borderWidth: 1, borderColor: "#BBF7D0", borderRadius: 6, paddingHorizontal: 12 },

    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#FFF",
    },
    chipActive: { backgroundColor: "#16A34A", borderColor: "#15803D" },
    chipTxt: { color: "#111827" },
    chipTxtActive: { color: "#FFF", fontWeight: "700" },

    actions: { flexDirection: "row", gap: 8, marginTop: 8 },
    btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: "center", flex: 1 },
    btnPrimary: { backgroundColor: "#10B981" },
    btnPrimaryTxt: { color: "#FFF", fontWeight: "700" },
    btnSecondary: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#D1D5DB" },
    btnSecondaryTxt: { color: "#111827", fontWeight: "700" },
});
