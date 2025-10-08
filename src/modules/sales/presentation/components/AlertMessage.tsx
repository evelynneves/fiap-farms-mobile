import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function AlertMessage({ message }: { message: string }) {
    if (!message) return null;
    return (
        <View style={styles.alert}>
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    alert: {
        backgroundColor: "#fee2e2",
        borderColor: "#fecaca",
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
    },
    text: { color: "#b91c1c", fontSize: 14 },
});
