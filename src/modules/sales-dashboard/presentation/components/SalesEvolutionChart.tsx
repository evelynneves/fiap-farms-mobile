import { eachDayOfInterval, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { DashboardSale } from "../../domain/entities/Sale";

type Period = "7d" | "30d" | "90d";
type Props = { salesData: DashboardSale[]; period: Period };

const currency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function SalesEvolutionChart({ salesData, period }: Props) {
    const chartWidth = Dimensions.get("window").width - 32; // padding externo do card

    const now = new Date();
    const start = period === "7d" ? subDays(now, 7) : period === "30d" ? subDays(now, 30) : subDays(now, 90);

    const { labels, values } = useMemo(() => {
        const parsed = salesData.map((s) => ({ ...s, _date: new Date(s.date) })).filter((s) => s._date >= start);

        let buckets: Date[] = [];
        let fmt = "EEE"; // seg, ter...
        if (period === "30d") fmt = "dd"; // 01, 02...
        if (period === "90d") fmt = "MMM"; // jan, fev...

        if (period === "7d" || period === "30d") {
            buckets = eachDayOfInterval({ start, end: now });
        } else {
            // 90d → pontos por mês (dia 1)
            const allDays = eachDayOfInterval({ start, end: now });
            buckets = allDays.filter((d) => d.getDate() === 1);
            if (buckets[buckets.length - 1]?.getMonth() !== now.getMonth()) {
                buckets.push(new Date(now.getFullYear(), now.getMonth(), 1));
            }
        }

        const totals = new Map<string, number>();
        for (const s of parsed) {
            const key = format(s._date, fmt, { locale: ptBR });
            totals.set(key, (totals.get(key) ?? 0) + s.revenue);
        }

        const labels = Array.from(new Set(buckets.map((d) => format(d, fmt, { locale: ptBR }))));

        return {
            labels,
            values: labels.map((lb) => totals.get(lb) ?? 0),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [salesData, period]);

    const data = {
        labels,
        datasets: [
            {
                data: values,
                // cor da linha (usa opacity do chart kit)
                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const chartConfig = {
        backgroundColor: "#FFFFFF",
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientTo: "#FFFFFF",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // ticks, eixo, etc.
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // #6B7280
        propsForDots: {
            r: "3",
        },
        // preenche a área abaixo da linha
        fillShadowGradientFrom: "#22C55E",
        fillShadowGradientTo: "#22C55E",
        fillShadowGradientFromOpacity: 0.15,
        fillShadowGradientToOpacity: 0.0,
    } as const;

    return (
        <View style={styles.card}>
            <Text style={styles.h3}>Evolução das Vendas</Text>
            <Text style={styles.sub}>Período: {period}</Text>

            <LineChart
                data={data}
                width={chartWidth}
                height={260}
                chartConfig={chartConfig}
                bezier
                withInnerLines
                withOuterLines={false}
                fromZero
                segments={5}
                formatYLabel={(y) => currency(Number(y)).replace(/^R\$\s?/, "R$ ")}
                style={{ borderRadius: 8 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 10, padding: 16 },
    h3: { fontSize: 16, fontWeight: "700", color: "#111827" },
    sub: { fontSize: 13, color: "#6B7280", marginTop: 2, marginBottom: 12 },
});
