import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    title: string;
    subtitle?: string;
};

export default function AppHeaderTitle({ title, subtitle }: Props) {
    return (
        <View style={styles.titleRow}>
            <View>
                <Text style={styles.h1}>{title}</Text>
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    titleRow: { flexDirection: "row", alignItems: "center" },
    h1: { fontSize: 14, fontWeight: "800", color: "#0b1220" },
    subtitle: { fontSize: 12, color: "#6B7280" },
});
