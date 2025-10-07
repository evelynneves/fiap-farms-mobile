import * as Icons from "lucide-react-native";
import { TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    title: string;
    value: string;
    change: string;
    positive: boolean;
    icon: keyof typeof Icons;
};

export default function KpiCard({ title, value, change, positive, icon }: Props) {
    const Icon =
        (Icons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[icon] ??
        Icons.Circle;

    return (
        <View style={styles.card}>
            <View style={{ gap: 2 }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>

            <View style={styles.right}>
                <View style={styles.iconWrap}>
                    <Icon size={20} color="#16a34a" />
                </View>
                <View style={[styles.change, positive ? styles.pos : styles.neg]}>
                    <TrendingUp size={14} color={positive ? "#16a34a" : "#dc2626"} />
                    <Text style={[styles.changeTxt, { color: positive ? "#16a34a" : "#dc2626" }]}>{change}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { color: "#6B7280", fontSize: 12 },
    value: { color: "#111827", fontWeight: "800", fontSize: 20 },
    right: { flexDirection: "row", alignItems: "center", gap: 10 },
    iconWrap: { padding: 8, borderRadius: 10, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#BBF7D0" },
    change: { flexDirection: "row", alignItems: "center", gap: 4 },
    pos: {},
    neg: {},
    changeTxt: { fontWeight: "700" },
});
