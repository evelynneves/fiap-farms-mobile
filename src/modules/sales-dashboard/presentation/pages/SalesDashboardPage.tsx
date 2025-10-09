import { subDays } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getItemsFromStorage, getSalesFromStorage } from "@/src/modules/shared/goal/infrastructure/goalService";

import { toDashboardSales } from "@/src/modules/sales-dashboard/application/usecases/transformSalesToDashboard";
import { Item } from "@/src/modules/sales-dashboard/domain/entities/Item";
import type { DashboardSale, Sale as DashboardSaleEntity } from "@/src/modules/sales-dashboard/domain/entities/Sale";

import CategoryDistributionChart from "@/src/modules/sales-dashboard/presentation/components/CategoryDistributionChart";
import { EmptyState } from "@/src/modules/sales-dashboard/presentation/components/EmptyState";
import ProfitChartBase from "@/src/modules/sales-dashboard/presentation/components/ProfitChart";
import SalesDashboardList from "@/src/modules/sales-dashboard/presentation/components/SalesDashboardList";
import SalesEvolutionChart from "@/src/modules/sales-dashboard/presentation/components/SalesEvolutionChart";
import { SummaryCards } from "@/src/modules/sales-dashboard/presentation/components/SummaryCards";
import TopProducts from "@/src/modules/sales-dashboard/presentation/components/TopProducts";
import { AlertMessage } from "@/src/modules/sales/presentation/components/AlertMessage";

import type { Sale as SharedSale } from "@/src/modules/shared/goal/domain/entities/Sale";

const ProfitChart = ProfitChartBase as unknown as React.ComponentType<{ salesData: DashboardSale[] }>;
type Period = "7d" | "30d" | "90d";

const withFarmPrefix = (farm?: string) => {
    if (!farm) return "";
    return /^fazenda\s/i.test(farm) ? farm : `Fazenda ${farm}`;
};

export default function SalesDashboardScreen() {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>("30d");
    const [items, setItems] = useState<Item[]>([]);
    const [sales, setSales] = useState<DashboardSaleEntity[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [its, s] = await Promise.all([getItemsFromStorage(), getSalesFromStorage()]);

                const itemsArr = its as unknown as Item[];
                const sharedSales = s as SharedSale[];

                const mapped: DashboardSaleEntity[] = sharedSales.map((sale) => {
                    const item = itemsArr.find((i) => i.id === sale.productId || i.name === sale.productName);

                    return {
                        id: sale.id ?? "",
                        productId: sale.productId,
                        productName: sale.productName,
                        farmName: withFarmPrefix(item?.farm),
                        quantity: sale.quantity,
                        salePrice: sale.salePrice,
                        totalValue: (sale as any)?.totalValue ?? sale.quantity * sale.salePrice,
                        date: sale.date,
                    };
                });

                setItems(itemsArr);
                setSales(mapped);
            } catch (err: any) {
                setError(err.message ?? "Erro ao carregar dados de vendas");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const dashboardSales = useMemo(() => toDashboardSales(sales), [sales]);

    const now = new Date();
    const startDate =
        selectedPeriod === "7d" ? subDays(now, 7) : selectedPeriod === "30d" ? subDays(now, 30) : subDays(now, 90);

    const filteredSales = useMemo(
        () => dashboardSales.filter((s) => new Date(s.date) >= startDate),
        [dashboardSales, startDate]
    );

    const activeFarms = useMemo(() => new Set(filteredSales.map((s) => s.farmName)).size, [filteredSales]);

    const totals = useMemo(
        () =>
            filteredSales.reduce(
                (acc, it) => ({
                    revenue: acc.revenue + it.revenue,
                    profit: acc.profit + it.profit,
                    units: acc.units + it.units,
                }),
                { revenue: 0, profit: 0, units: 0 }
            ),
        [filteredSales]
    );

    const categoryData = useMemo(() => {
        const map: Record<string, number> = {};
        filteredSales.forEach((s) => {
            const item = items.find((i) => i.name === s.product);
            const cat = item?.category ?? "Outros";
            map[cat] = (map[cat] ?? 0) + s.revenue;
        });
        const palette = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"];
        return Object.keys(map).map((cat, idx) => ({
            name: cat,
            value: map[cat],
            color: palette[idx % palette.length],
        }));
    }, [filteredSales, items]);

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.loading}>
                <AlertMessage message={error} />
            </View>
        );
    }

    if (items.length === 0 || sales.length === 0) {
        return (
            <View style={styles.emptyWrapper}>
                <EmptyState
                    title="Nenhum dado de vendas encontrado"
                    description="Para visualizar estatísticas, cadastre produtos e registre vendas no sistema."
                />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.periodRow}>
                {(["7d", "30d", "90d"] as Period[]).map((p) => (
                    <Pressable
                        key={p}
                        onPress={() => setSelectedPeriod(p)}
                        style={[styles.periodBtn, selectedPeriod === p && styles.periodBtnActive]}
                    >
                        <Text style={[styles.periodTxt, selectedPeriod === p && styles.periodTxtActive]}>{p}</Text>
                    </Pressable>
                ))}
            </View>

            <SummaryCards
                revenue={totals.revenue}
                profit={totals.profit}
                productsSold={totals.units}
                activeFarms={activeFarms}
            />

            <View style={styles.row}>
                <View style={styles.cardCol}>
                    <ProfitChart salesData={filteredSales} />
                </View>
                <View style={styles.cardCol}>
                    <SalesEvolutionChart salesData={filteredSales} period={selectedPeriod} />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.cardCol}>
                    <CategoryDistributionChart data={categoryData} />
                </View>
                <View style={styles.cardCol}>
                    <TopProducts salesData={filteredSales} />
                </View>
            </View>

            <SalesDashboardList salesData={filteredSales} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB" },
    container: { padding: 16, gap: 16, backgroundColor: "#F9FAFB", flexGrow: 1 },
    periodRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
    periodBtn: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },
    periodBtnActive: { backgroundColor: "#16a34a", borderColor: "#15803d" },
    periodTxt: { color: "#111827" },
    periodTxtActive: { color: "#fff", fontWeight: "700" },
    row: { gap: 16 },
    cardCol: { gap: 16 },
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        padding: 32,
    },
});
