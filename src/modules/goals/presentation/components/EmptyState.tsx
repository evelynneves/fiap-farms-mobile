import { Target } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    title: string;
    description?: string;
    onClearFilter?: () => void;
}

export function EmptyState({ title, description, onClearFilter }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrap}>
                <Target size={48} color="#16A34A" />
            </View>
            <Text style={styles.title}>{title}</Text>
            {!!description && <Text style={styles.desc}>{description}</Text>}
            {onClearFilter && (
                <TouchableOpacity style={styles.secondaryBtn} onPress={onClearFilter}>
                    <Text style={styles.secondaryBtnText}>Limpar filtro</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: "center", padding: 16, gap: 8 },
    iconWrap: {
        backgroundColor: "#DCFCE7",
        borderRadius: 12,
        padding: 10,
        marginBottom: 6,
    },
    title: { fontSize: 16, fontWeight: "700", color: "#111827" },
    desc: { fontSize: 14, color: "#6B7280", textAlign: "center" },
    secondaryBtn: {
        marginTop: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFF",
    },
    secondaryBtnText: { color: "#111827", fontWeight: "600" },
});
