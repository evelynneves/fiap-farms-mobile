import { CheckCircle, Clock, MapPin, Zap } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { deriveProductionStatus } from "../../application/usecases/deriveProductionStatus";
import { Item } from "../../domain/entities/Item";

type Props = { item: Item };

export function ProductionCard({ item }: Props) {
    const { stage, progress } = deriveProductionStatus(item);

    const statusMap = {
        waiting: { label: "Aguardando", cls: styles.waiting, Icon: Clock },
        production: { label: "Em Produção", cls: styles.production, Icon: Zap },
        harvested: { label: "Colhido", cls: styles.harvested, Icon: CheckCircle },
    } as const;

    const info = statusMap[stage];
    const StatusIcon = info.Icon;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.title}>
                    <Text style={styles.h3}>{item.name}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.meta}>
                            <MapPin size={14} color="#6B7280" />
                            <Text style={styles.metaTxt}>{item.farm}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.badge, info.cls]}>
                    <StatusIcon size={12} color="currentColor" />
                    <Text style={styles.badgeTxt}>{info.label}</Text>
                </View>
            </View>

            <View style={styles.body}>
                <View style={styles.infoGrid}>
                    <View>
                        <Text style={styles.strong}>Estoque Atual</Text>
                        <Text style={styles.val}>
                            {item.quantity} {item.unit}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.strong}>Mínimo</Text>
                        <Text style={styles.val}>
                            {item.minStock} {item.unit}
                        </Text>
                    </View>
                </View>

                <View style={styles.progressWrap}>
                    <Text style={styles.progressLabel}>Progresso {progress}%</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, progress))}%` }]} />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerTxt}>{item.category}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        padding: 16,
        gap: 12,
    },
    header: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    title: { gap: 8, flex: 1 },
    h3: { fontSize: 16, fontWeight: "700", color: "#111827" },
    metaRow: { flexDirection: "row", gap: 12 },
    meta: { flexDirection: "row", alignItems: "center", gap: 6 },
    metaTxt: { color: "#6B7280", fontSize: 13 },

    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeTxt: { fontSize: 12, fontWeight: "700" },
    waiting: { backgroundColor: "#FEF3C7", color: "#B45309" },
    production: { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
    harvested: { backgroundColor: "#DCFCE7", color: "#15803D" },

    body: { gap: 12 },
    infoGrid: { flexDirection: "row", gap: 12 },
    strong: { fontWeight: "700", marginBottom: 2, color: "#111827" },
    val: { color: "#111827" },

    progressWrap: { gap: 6 },
    progressLabel: { color: "#4B5563", fontSize: 14 },
    progressBar: { height: 8, backgroundColor: "#EEF2F7", borderRadius: 999, overflow: "hidden" },
    progressFill: { height: "100%", backgroundColor: "#000" },

    footer: { borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 10 },
    footerTxt: { fontSize: 14, color: "#4B5563" },
});
