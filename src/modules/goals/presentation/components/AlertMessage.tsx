import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Tone = "success" | "warning" | "error" | "info";

interface Props {
    message: string;
    tone?: Tone;
}

const COLORS: Record<Tone, { bg: string; fg: string }> = {
    success: { bg: "#DCFCE7", fg: "#166534" },
    warning: { bg: "#FEF3C7", fg: "#92400E" },
    error: { bg: "#FEE2E2", fg: "#991B1B" },
    info: { bg: "#DBEAFE", fg: "#1D4ED8" },
};

export function AlertMessage({ message, tone = "info" }: Props) {
    const c = COLORS[tone];
    return (
        <View style={[styles.alert, { backgroundColor: c.bg }]}>
            <Text style={[styles.text, { color: c.fg }]}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    alert: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    text: { fontSize: 14, fontWeight: "600" },
});
