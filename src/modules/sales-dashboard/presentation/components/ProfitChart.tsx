import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import type { DashboardSale } from "../../domain/entities/Sale";

type Props = { salesData: DashboardSale[] };

export default function ProfitChart({ salesData }: Props) {
    const grouped = salesData.reduce((acc, s) => {
        const curr = acc.get(s.product) ?? 0;
        acc.set(s.product, curr + (Number.isFinite(s.profit) ? s.profit : 0));
        return acc;
    }, new Map<string, number>());

    const top = Array.from(grouped, ([product, profit]) => ({ product, profit }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5);

    const labels = top.map((t) => t.product);
    const data = top.map((t) => t.profit);

    const baseWidth = Dimensions.get("window").width - 64;
    const chartWidth = Math.max(baseWidth, labels.length * 100);

    return (
        <View style={styles.card}>
            <Text style={styles.h3}>Lucro por Produto (Top 5)</Text>
            <Text style={styles.sub}>Produtos com maior margem de lucro</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                    data={{
                        labels,
                        datasets: [{ data }],
                    }}
                    width={chartWidth}
                    height={340}
                    yLabelsOffset={-5}
                    xLabelsOffset={15}
                    fromZero
                    showValuesOnTopOfBars
                    verticalLabelRotation={20}
                    withVerticalLabels
                    chartConfig={{
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        color: (o) => `rgba(34, 197, 94, ${o ?? 1})`,
                        labelColor: () => "#374151",
                        decimalPlaces: 0,
                        propsForBackgroundLines: { stroke: "#E5E7EB" },
                    }}
                    style={{ borderRadius: 8, alignSelf: "center" }}
                    yAxisLabel="R$ "
                />
            </ScrollView>
        </View>
    );
}

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
});
