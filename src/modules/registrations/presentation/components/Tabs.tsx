import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = { active: "farms" | "categories"; onChange: (v: "farms" | "categories") => void };

export function Tabs({ active, onChange }: Props) {
    return (
        <View style={styles.wrap}>
            <Pressable onPress={() => onChange("farms")} style={[styles.tab, active === "farms" && styles.active]}>
                <Text style={[styles.tabTxt, active === "farms" && styles.activeTxt]}>Fazendas</Text>
            </Pressable>
            <Pressable
                onPress={() => onChange("categories")}
                style={[styles.tab, active === "categories" && styles.active]}
            >
                <Text style={[styles.tabTxt, active === "categories" && styles.activeTxt]}>Categorias</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#E5E7EB", maxWidth: 400 },
    tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
    tabTxt: { color: "#6B7280", fontWeight: "600" },
    active: { borderBottomWidth: 2, borderBottomColor: "#10B981" },
    activeTxt: { color: "#10B981" },
});
