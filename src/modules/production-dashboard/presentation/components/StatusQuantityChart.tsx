import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { G, Rect } from "react-native-svg";
import { Item } from "../../domain/entities/Item";

type Props = { productions: Item[] };

const COLORS = {
    waiting: "#eab308",
    production: "#3b82f6",
    harvested: "#22c55e",
};

export function StatusQuantityChart({ productions }: Props) {
    const series = useMemo(() => {
        const waiting = productions.filter((p: any) => p.productionStage === "waiting").length;
        const prod = productions.filter((p: any) => p.productionStage === "production").length;
        const harv = productions.filter((p: any) => p.productionStage === "harvested").length;

        const data = [
            { name: "Aguardando", value: waiting, color: COLORS.waiting },
            { name: "Em Produção", value: prod, color: COLORS.production },
            { name: "Colhido", value: harv, color: COLORS.harvested },
        ].filter((d) => d.value > 0);

        const max = Math.max(1, ...data.map((d) => d.value));
        return { data, max };
    }, [productions]);

    const W = 300;
    const H = 200;
    const pad = 24;
    const barW = 40;
    const gap = 32;

    const totalWidth = series.data.length * barW + (series.data.length - 1) * gap;
    const offsetX = (W - totalWidth) / 2;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.h2}>Quantidade Absoluta por Status</Text>
                <Text style={styles.sub}>Total de itens em cada estágio</Text>
            </View>

            <View style={styles.chartWrap}>
                <Svg width={W} height={H}>
                    <G translateX={offsetX} translateY={H - pad}>
                        {series.data.map((d, i) => {
                            const x = i * (barW + gap);
                            const h = Math.round((d.value / series.max) * (H - pad * 2));
                            return (
                                <G key={d.name} translateX={x} translateY={-h}>
                                    <Rect x={0} y={0} width={barW} height={h} fill={d.color} rx={6} />
                                </G>
                            );
                        })}
                    </G>
                </Svg>

                <View style={styles.legend}>
                    {series.data.map((d) => (
                        <View key={d.name} style={styles.legendRow}>
                            <View style={[styles.swatch, { backgroundColor: d.color }]} />
                            <Text style={styles.legendTxt}>
                                {d.name} ({d.value})
                            </Text>
                        </View>
                    ))}
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
        alignItems: "center",
    },
    header: { gap: 4, alignItems: "center" },
    h2: { fontSize: 18, fontWeight: "700", color: "#111827" },
    sub: { fontSize: 13, color: "#6B7280" },

    chartWrap: {
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
        marginTop: 8,
    },
    legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendTxt: { color: "#111827", fontSize: 13 },
    swatch: { width: 14, height: 14, borderRadius: 4 },
});
