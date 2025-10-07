import React, { useMemo } from "react";
import { Dimensions, StyleSheet as RNStyleSheet, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

type Props = {
    data: { name: string; value: number; color: string }[];
};

export default function CategoryDistributionChart({ data }: Props) {
    const total = useMemo(() => data.reduce((a, d) => a + d.value, 0), [data]);

    // largura do gráfico (respeitando paddings externos)
    const width = Dimensions.get("window").width - 32;
    const height = 260;

    // mapeia para o formato do chart-kit
    const pieData = data.map((d) => ({
        name: d.name,
        population: d.value, // accessor "population" é o valor do slice
        color: d.color,
        legendFontColor: "#374151",
        legendFontSize: 12,
    }));

    return (
        <View style={styles.card}>
            <Text style={styles.h3}>Participação por Categoria</Text>
            <Text style={styles.sub}>Distribuição percentual das vendas</Text>

            <View style={{ width: "100%", height, justifyContent: "center", alignItems: "center" }}>
                <PieChart
                    data={pieData}
                    width={width}
                    height={height}
                    accessor="population"
                    backgroundColor="transparent"
                    hasLegend
                    chartConfig={chartConfig}
                    // absolute = false (padrão) -> mostra % nos slices
                    // absolute = true -> mostra valores absolutos (population)
                    // absolute
                    paddingLeft="0"
                    center={[0, 0]}
                />

                {/* “Fura” o centro pra simular donut */}
                <View style={[RNStyleSheet.absoluteFillObject, styles.centerWrap]}>
                    <View style={styles.hole} />
                    <View style={RNStyleSheet.absoluteFillObject} />
                    <View style={styles.centerLabel}>
                        <Text style={styles.centerTitle}>{total.toLocaleString()}</Text>
                        <Text style={styles.centerSub}>total</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`, // #111827
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

    // donut fake
    centerWrap: { justifyContent: "center", alignItems: "center" },
    hole: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#fff", // mesma cor do card
        position: "absolute",
    },
    centerLabel: { alignItems: "center", justifyContent: "center" },
    centerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
    centerSub: { fontSize: 12, color: "#6B7280" },
});
