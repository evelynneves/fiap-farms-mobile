import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { Item } from "../../domain/entities/Item";

type Props = { productions: Item[] };

const COLORS = {
    waiting: "#eab308",
    production: "#3b82f6",
    harvested: "#22c55e",
};

export function StatusDistributionChart({ productions }: Props) {
    const counts = useMemo(() => {
        const total = productions.length || 1;
        const waiting = productions.filter((p) => p.productionStage === "waiting").length;
        const prod = productions.filter((p) => p.productionStage === "production").length;
        const harv = productions.filter((p) => p.productionStage === "harvested").length;
        return { total, waiting, prod, harv };
    }, [productions]);

    const data = [
        { key: "Aguardando", value: counts.waiting, color: COLORS.waiting },
        { key: "Em Produção", value: counts.prod, color: COLORS.production },
        { key: "Colhido", value: counts.harv, color: COLORS.harvested },
    ].filter((d) => d.value > 0);

    const size = 220;
    const r = 90;
    const cx = size / 2;
    const cy = size / 2;
    const strokeW = 18;

    let startAngle = -Math.PI / 2;
    const arcs = data.map((d) => {
        const angle = (d.value / (counts.total || 1)) * Math.PI * 2;
        const endAngle = startAngle + angle;
        const path = arcPath(cx, cy, r, startAngle, endAngle);
        startAngle = endAngle;
        return { ...d, path };
    });

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.h2}>Distribuição dos Itens por Status</Text>
                <Text style={styles.sub}>Percentual de produtos em cada status</Text>
            </View>

            <View style={styles.chartWrap}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <G>
                        <Circle cx={cx} cy={cy} r={r} fill="#F3F4F6" />
                        {arcs.map((a, i) => (
                            <Path key={i} d={a.path} fill={a.color} />
                        ))}
                        <Circle cx={cx} cy={cy} r={r - strokeW} fill="#FFF" />
                    </G>
                </Svg>

                {/* Legenda abaixo do gráfico */}
                <View style={styles.legend}>
                    {data.map((d) => {
                        const pct = counts.total ? ((d.value / counts.total) * 100).toFixed(1) : "0.0";
                        return (
                            <View key={d.key} style={styles.legendRow}>
                                <View style={[styles.swatch, { backgroundColor: d.color }]} />
                                <Text style={styles.legendTxt}>
                                    {d.key}: {pct}%
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
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
    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendTxt: { color: "#111827", fontSize: 13 },
    swatch: { width: 14, height: 14, borderRadius: 4 },
});
