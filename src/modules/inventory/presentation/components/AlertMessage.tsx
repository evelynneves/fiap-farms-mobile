import { AlertTriangle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    message: string;
    type?: "error" | "warning";
};

export function AlertMessage({ message, type = "error" }: Props) {
    const isError = type === "error";
    return (
        <View style={[styles.alert, isError ? styles.err : styles.warn]}>
            <AlertTriangle size={16} color={isError ? "#B91C1C" : "#CA8A04"} />
            <Text style={[styles.text, isError ? styles.errTxt : styles.warnTxt]}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    alert: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 12,
    },
    err: { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" },
    warn: { backgroundColor: "#FEF9C3", borderColor: "#FDE68A" },
    text: { fontSize: 14 },
    errTxt: { color: "#7F1D1D", fontWeight: "600" },
    warnTxt: { color: "#92400E", fontWeight: "600" },
});
