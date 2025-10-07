import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Key = "all" | "sales" | "production";
interface Props {
    selected: Key;
    onSelect: (key: Key) => void;
}

const items: { key: Key; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "sales", label: "Vendas" },
    { key: "production", label: "Produção" },
];

export function FilterButtons({ selected, onSelect }: Props) {
    return (
        <View style={styles.row}>
            {items.map((it) => {
                const active = selected === it.key;
                return (
                    <TouchableOpacity
                        key={it.key}
                        onPress={() => onSelect(it.key)}
                        style={[styles.btn, active && styles.btnActive]}
                    >
                        <Text style={[styles.btnText, active && styles.btnTextActive]}>{it.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    btn: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFF",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    btnActive: { backgroundColor: "#16A34A", borderColor: "#15803D" },
    btnText: { fontSize: 13, color: "#111827", fontWeight: "600" },
    btnTextActive: { color: "#FFF" },
});
