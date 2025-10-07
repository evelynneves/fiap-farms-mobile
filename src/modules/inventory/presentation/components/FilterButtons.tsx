import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

type Props = {
    categories: string[];
    selected: string;
    onSelect: (value: string) => void;
};

export function FilterButtons({ categories, selected, onSelect }: Props) {
    const all = ["all", ...categories];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {all.map((c) => {
                const active = selected === c;
                return (
                    <Pressable key={c} onPress={() => onSelect(c)} style={[styles.chip, active && styles.chipActive]}>
                        <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
                            {c === "all" ? "Todos" : c}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: { gap: 8, paddingHorizontal: 16 },
    chip: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFF",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    chipActive: { backgroundColor: "#16A34A", borderColor: "#15803D" },
    chipTxt: { fontSize: 13, color: "#111827" },
    chipTxtActive: { color: "#FFF", fontWeight: "700" },
});
