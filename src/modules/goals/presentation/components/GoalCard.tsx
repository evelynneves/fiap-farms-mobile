import { Calendar, DollarSign, Package } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getGoalStatus } from "../../application/usecases/getGoalStatus";
import type { Goal } from "../../domain/entities/Goal";

interface Props {
    goal: Goal;
    onEdit: (g: Goal) => void;
    onDelete: (id: string) => void;
}

const STATUS_COLORS = {
    active: { bg: "#DBEAFE", fg: "#1D4ED8" },
    completed: { bg: "#DCFCE7", fg: "#15803D" },
    overdue: { bg: "#FEE2E2", fg: "#B91C1C" },
};

export function GoalCard({ goal, onEdit, onDelete }: Props) {
    const status = getGoalStatus(goal); // { status, label }
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    const sc = STATUS_COLORS[status.status];

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleWrap}>
                    <Text style={styles.title}>{goal.title}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.meta}>
                            {goal.type === "sales" ? (
                                <DollarSign size={14} color="#6B7280" />
                            ) : (
                                <Package size={14} color="#6B7280" />
                            )}
                            <Text style={styles.metaText}>
                                {goal.type === "sales" ? "Vendas" : "Produção"} - {goal.productName}
                            </Text>
                        </View>
                        <View style={styles.meta}>
                            <Calendar size={14} color="#6B7280" />
                            <Text style={styles.metaText}>{new Date(goal.deadline).toLocaleDateString("pt-BR")}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.badgeText, { color: sc.fg }]}>{status.label}</Text>
                </View>
            </View>

            <View style={styles.progressWrap}>
                <View style={styles.progressTop}>
                    <Text style={styles.progressLabel}>Progresso</Text>
                    <Text style={styles.progressValue}>
                        {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                    </Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressInner, { width: `${progress}%` }]} />
                </View>
                <View style={styles.progressFoot}>
                    <Text style={styles.progressFootText}>{progress.toFixed(1)}% concluído</Text>
                    {progress >= 100 && <Text style={styles.ok}>✓ Meta atingida!</Text>}
                </View>
            </View>

            {!!goal.description && <Text style={styles.desc}>{goal.description}</Text>}

            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(goal)}>
                    <Text style={styles.actionTxt}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionDanger]} onPress={() => onDelete(goal.id)}>
                    <Text style={[styles.actionTxt, styles.actionDangerTxt]}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 16 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
    titleWrap: { gap: 8, flex: 1 },
    title: { fontSize: 16, fontWeight: "700", color: "#111827" },
    metaRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
    meta: { flexDirection: "row", alignItems: "center", gap: 6 },
    metaText: { color: "#6B7280", fontSize: 13 },
    badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "700" },
    progressWrap: { marginTop: 10 },
    progressTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    progressLabel: { fontSize: 13, color: "#374151" },
    progressValue: { fontSize: 13, color: "#111827", fontWeight: "600" },
    progressBar: { height: 8, backgroundColor: "#EEF2F7", borderRadius: 999, overflow: "hidden", marginVertical: 6 },
    progressInner: { height: "100%", backgroundColor: "#000" },
    progressFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    progressFootText: { fontSize: 13, color: "#374151" },
    ok: { color: "#15803D", fontWeight: "700" },
    desc: {
        marginTop: 12,
        color: "#4B5563",
        fontSize: 14,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        paddingTop: 12,
    },
    actionsRow: { flexDirection: "row", gap: 12, marginTop: 12 },
    actionBtn: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#FFF",
    },
    actionTxt: { color: "#111827", fontWeight: "700" },
    actionDanger: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
    actionDangerTxt: { color: "#B91C1C" },
});
