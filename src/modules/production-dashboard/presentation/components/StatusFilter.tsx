import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

type Key = "all" | "waiting" | "production" | "harvested";
type Props = { selected: Key; onSelect: (k: Key) => void };

export function StatusFilter({ selected, onSelect }: Props) {
    const items: { key: Key; label: string }[] = [
        { key: "all", label: "Todos" },
        { key: "waiting", label: "Aguardando" },
        { key: "production", label: "Em Produção" },
        { key: "harvested", label: "Colhido" },
    ];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {items.map((it) => {
                const active = selected === it.key;
                return (
                    <Pressable
                        key={it.key}
                        onPress={() => onSelect(it.key)}
                        style={[styles.btn, active && styles.btnActive]}
                    >
                        <Text style={[styles.txt, active && styles.txtActive]}>{it.label}</Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: { gap: 8, paddingVertical: 8 },
    btn: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFF",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    btnActive: { backgroundColor: "#16A34A", borderColor: "#15803D" },
    txt: { fontSize: 13, color: "#111827" },
    txtActive: { color: "#FFF", fontWeight: "700" },
});
