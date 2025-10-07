import { CheckCircle, Clock, MapPin, Zap } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = { totalArea: number; waiting: number; production: number; harvested: number };

export function SummaryCards({ totalArea, waiting, production, harvested }: Props) {
    return (
        <View style={styles.grid}>
            <Card
                accent="#22C55E"
                icon={<MapPin size={18} color="#16A34A" />}
                title="Área Total"
                value={`${totalArea} ha`}
            />
            <Card accent="#FACC15" icon={<Clock size={18} color="#EAB308" />} title="Aguardando" value={`${waiting}`} />
            <Card
                accent="#3B82F6"
                icon={<Zap size={18} color="#2563EB" />}
                title="Em Produção"
                value={`${production}`}
            />
            <Card
                accent="#22C55E"
                icon={<CheckCircle size={18} color="#16A34A" />}
                title="Colhido"
                value={`${harvested}`}
            />
        </View>
    );
}

function Card({ accent, icon, title, value }: { accent: string; icon: React.ReactNode; title: string; value: string }) {
    return (
        <View style={[styles.card, { borderLeftColor: accent }]}>
            <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
            <View style={styles.iconWrap}>{icon}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { gap: 12, marginBottom: 16 },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 6,
    },
    title: { color: "#6B7280", fontSize: 13, marginBottom: 2 },
    value: { fontSize: 20, fontWeight: "700", color: "#111827" },
    iconWrap: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
});
