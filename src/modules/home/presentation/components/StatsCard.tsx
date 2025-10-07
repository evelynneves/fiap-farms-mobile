import { TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { DashboardStat } from "../../domain/entities/DashboardStat";

type Props = {
    stat: DashboardStat;
    /** opcional: um ícone do lucide-react-native pra exibir na pastilha */
    icon?: React.ReactNode;
    /** opcional: cor da pastilha do ícone */
    tint?: string; // ex: "#EAF7F0"
    /** opcional: callback se o card for “clicável” */
    onPress?: () => void;
};

export default function StatsCard({ stat, icon, tint = "#F1F8F4", onPress }: Props) {
    const positive = !!stat.positive;
    const DeltaIcon = positive ? TrendingUp : TrendingDown;
    const deltaColor = positive ? "#16A34A" : "#DC2626";

    const Container = onPress ? Pressable : View;
    const containerProps = onPress ? { android_ripple: { color: "#E3F6EA" }, onPress } : {};

    return (
        <Container style={styles.card} {...containerProps}>
            <View style={styles.row}>
                <View style={styles.left}>
                    {/* Ícone opcional */}
                    {icon ? <View style={[styles.iconWrap, { backgroundColor: tint }]}>{icon}</View> : null}

                    <View style={styles.textCol}>
                        <Text style={styles.title}>{stat.title}</Text>
                        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                            {String(stat.value)}
                        </Text>
                    </View>
                </View>

                <View style={styles.right}>
                    <View style={[styles.deltaChip, { backgroundColor: positive ? "#E7F6EE" : "#FEE2E2" }]}>
                        <DeltaIcon size={14} color={deltaColor} />
                        <Text style={[styles.deltaText, { color: deltaColor }]}>{stat.change}</Text>
                    </View>
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        // sombra suave
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        ...(Platform.OS === "android" ? { elevation: 1 } : null),
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 72,
        gap: 12,
    },
    left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    textCol: { flex: 1 },
    title: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
    value: { fontSize: 26, fontWeight: "800", color: "#0B1220" },
    right: { alignItems: "flex-end" },
    deltaChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
    },
    deltaText: { fontSize: 13, fontWeight: "700" },
});
