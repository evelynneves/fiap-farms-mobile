import React, { useMemo } from "react";
import { Dimensions, StyleSheet as RNStyleSheet, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

type Props = {
    data: { name: string; value: number; color: string }[];
};

export default function CategoryDistributionChart({ data }: Props) {
    const total = useMemo(() => data.reduce((a, d) => a + d.value, 0), [data]);

    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - 32;
    const height = 300;

    const pieData = [
        ...data.map((d) => ({
            name: d.name,
            population: d.value,
            color: d.color,
            legendFontColor: "#374151",
            legendFontSize: 12,
        })),
        {
            name: "__invisible__",
            population: 0.0001,
            color: "transparent",
            legendFontColor: "transparent",
            legendFontSize: 0,
        },
    ];

    const offsetX = 40;
    const offsetY = 0;

    return (
        <View style={styles.card}>
            <Text style={styles.h3}>Participação por Categoria</Text>
            <Text style={styles.sub}>Distribuição percentual das vendas</Text>

            <View style={styles.chartWrapper}>
                <PieChart
                    data={pieData}
                    width={chartWidth}
                    height={height - 70}
                    accessor="population"
                    backgroundColor="transparent"
                    hasLegend={false}
                    chartConfig={chartConfig}
                    center={[offsetX, offsetY]}
                    paddingLeft="0"
                />

                <View style={[RNStyleSheet.absoluteFillObject, styles.centerWrap]}>
                    <View style={styles.hole} />
                    <View style={styles.centerLabel}>
                        <Text style={styles.centerTitle}>{total.toLocaleString("pt-BR")}</Text>
                        <Text style={styles.centerSub}>total</Text>
                    </View>
                </View>
            </View>

            <View style={styles.legendContainer}>
                {data.map((d) => (
                    <View key={d.name} style={styles.legendItem}>
                        <View style={[styles.swatch, { backgroundColor: d.color }]} />
                        <Text style={styles.legendTxt}>
                            {Math.round((d.value / total) * 100)}% {d.name}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`,
    decimalPlaces: 0,
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        borderRadius: 10,
        padding: 16,
    },
    h3: { fontSize: 16, fontWeight: "700", color: "#111827" },
    sub: { fontSize: 13, color: "#6B7280", marginTop: 2, marginBottom: 12 },

    chartWrapper: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 230,
        marginBottom: 8,
    },

    centerWrap: { justifyContent: "center", alignItems: "center" },
    hole: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#fff",
        position: "absolute",
    },
    centerLabel: { alignItems: "center", justifyContent: "center" },
    centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
    centerSub: { fontSize: 12, color: "#6B7280" },

    legendContainer: {
        marginTop: 16,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    swatch: { width: 12, height: 12, borderRadius: 3 },
    legendTxt: { color: "#111827", fontSize: 13 },
});
