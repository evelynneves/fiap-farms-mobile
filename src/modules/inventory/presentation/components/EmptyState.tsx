import { Package } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    title: string;
    description?: string;
    onClearFilter?: () => void;
};

export function EmptyState({ title, description, onClearFilter }: Props) {
    return (
        <View style={styles.root}>
            <View style={styles.iconWrap}>
                <Package size={48} color="#16A34A" />
            </View>
            <Text style={styles.h3}>{title}</Text>
            {!!description && <Text style={styles.desc}>{description}</Text>}
            {onClearFilter && (
                <Pressable onPress={onClearFilter} style={styles.btnSecondary}>
                    <Text style={styles.btnSecondaryTxt}>Limpar filtro</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { alignItems: "center", gap: 8, padding: 16 },
    iconWrap: {
        backgroundColor: "#F0FDF4",
        padding: 12,
        borderRadius: 12,
        marginBottom: 4,
    },
    h3: { fontSize: 16, fontWeight: "700", color: "#111827" },
    desc: { fontSize: 13, color: "#6B7280", textAlign: "center" },
    btnSecondary: {
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFF",
    },
    btnSecondaryTxt: { color: "#111827", fontWeight: "600" },
});
