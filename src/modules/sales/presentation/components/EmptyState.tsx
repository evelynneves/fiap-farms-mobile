import { DollarSign } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = { title: string; description?: string };

export function EmptyState({ title, description }: Props) {
    return (
        <View style={styles.root}>
            <View style={styles.iconWrap}>
                <DollarSign size={48} color="#16A34A" />
            </View>
            <Text style={styles.h3}>{title}</Text>
            {!!description && <Text style={styles.desc}>{description}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { alignItems: "center", gap: 8, padding: 16 },
    iconWrap: { backgroundColor: "#F0FDF4", padding: 12, borderRadius: 12 },
    h3: { fontSize: 16, fontWeight: "700", color: "#111827" },
    desc: { fontSize: 13, color: "#6B7280", textAlign: "center" },
});
