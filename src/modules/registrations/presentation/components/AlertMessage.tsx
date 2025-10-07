import { AlertTriangle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = { message: string };

export function AlertMessage({ message }: Props) {
    return (
        <View style={styles.wrap} accessibilityRole="alert">
            <AlertTriangle size={16} color="#B91C1C" />
            <Text style={styles.txt}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FEE2E2",
        borderWidth: 1,
        borderColor: "#FECACA",
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
    },
    txt: { color: "#B91C1C" },
});
