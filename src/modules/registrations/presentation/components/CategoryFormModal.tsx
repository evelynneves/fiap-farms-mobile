import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Category } from "../../domain/entities/Category";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Category, isEdit: boolean) => void;
    editingCategory?: Category | null;
};

export function CategoryFormModal({ isOpen, onClose, onSave, editingCategory }: Props) {
    const [name, setName] = useState("");

    useEffect(() => {
        setName(editingCategory?.name ?? "");
    }, [editingCategory, isOpen]);

    const submit = () => {
        const category: Category = { id: editingCategory?.id ?? "", name: name.trim() };
        onSave(category, !!editingCategory);
        setName("");
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
                            <Text style={styles.h2}>
                                {editingCategory ? "Editar Categoria" : "Cadastrar Nova Categoria"}
                            </Text>
                            <Text style={styles.sub}>
                                {editingCategory
                                    ? "Atualize os dados da categoria"
                                    : "Informe o nome da nova categoria"}
                            </Text>
                            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button">
                                <Text style={styles.closeTxt}>×</Text>
                            </Pressable>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Nome da Categoria *</Text>
                            <TextInput
                                placeholder="Ex: Grãos"
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                            />

                            <View style={styles.actions}>
                                <Pressable onPress={submit} style={[styles.btn, styles.btnPrimary]}>
                                    <Text style={styles.btnPrimaryTxt}>{editingCategory ? "Salvar" : "Cadastrar"}</Text>
                                </Pressable>
                                <Pressable onPress={onClose} style={[styles.btn, styles.btnSecondary]}>
                                    <Text style={styles.btnSecondaryTxt}>Cancelar</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
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
    container: { backgroundColor: "#FFF", width: "100%", maxWidth: 500, borderRadius: 8, padding: 16 },
    header: { marginBottom: 12 },
    h2: { fontSize: 20, fontWeight: "700", color: "#111827" },
    sub: { marginTop: 4, color: "#6B7280" },
    closeBtn: { position: "absolute", right: 8, top: 8, padding: 4 },
    closeTxt: { fontSize: 22, color: "#111827" },
    form: { gap: 12 },
    label: { fontSize: 14, fontWeight: "600", color: "#374151" },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: "#BBF7D0",
        borderRadius: 6,
        paddingHorizontal: 12,
    },
    actions: { flexDirection: "row", gap: 8, marginTop: 4 },
    btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: "center", flex: 1 },
    btnPrimary: { backgroundColor: "#10B981" },
    btnPrimaryTxt: { color: "#FFF", fontWeight: "700" },
    btnSecondary: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#D1D5DB" },
    btnSecondaryTxt: { color: "#111827", fontWeight: "700" },
});
