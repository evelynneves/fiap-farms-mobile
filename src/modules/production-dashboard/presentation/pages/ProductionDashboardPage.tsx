import { deriveProductionStatus } from "@/src/modules/production-dashboard/application/usecases/deriveProductionStatus";
import { Item } from "@/src/modules/production-dashboard/domain/entities/Item";
import { EmptyState } from "@/src/modules/production-dashboard/presentation/components/EmptyState";
import { ProductionCard } from "@/src/modules/production-dashboard/presentation/components/ProductionCard";
import { StatusDistributionChart } from "@/src/modules/production-dashboard/presentation/components/StatusDistributionChart";
import { StatusFilter } from "@/src/modules/production-dashboard/presentation/components/StatusFilter";
import { StatusQuantityChart } from "@/src/modules/production-dashboard/presentation/components/StatusQuantityChart";
import { SummaryCards } from "@/src/modules/production-dashboard/presentation/components/SummaryCards";
import { getItemsFromStorage } from "@/src/modules/shared/goal/infrastructure/goalService";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

type Stage = "waiting" | "production" | "harvested";
type ItemWithStage = Item & { productionStage: Stage; progress: number };

export default function ProductionDashboardScreen() {
    const [items, setItems] = useState<ItemWithStage[]>([]);
    const [filter, setFilter] = useState<"all" | Stage>("all");
    const [loading, setLoading] = useState(true);

    const stageLabels: Record<Stage, string> = {
        waiting: "Aguardando",
        production: "Em Produção",
        harvested: "Colhido",
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const its = await getItemsFromStorage();
                const enriched = (its as unknown as Item[]).map((item) => {
                    const d = deriveProductionStatus(item);
                    return { ...item, productionStage: d.stage, progress: d.progress } as ItemWithStage;
                });
                setItems(enriched);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(
        () => items.filter((it) => (filter === "all" ? true : it.productionStage === filter)),
        [items, filter]
    );

    const totalArea = items.reduce((sum, i) => sum + i.quantity, 0);
    const waiting = items.filter((i) => i.productionStage === "waiting").length;
    const productionCount = items.filter((i) => i.productionStage === "production").length;
    const harvested = items.filter((i) => i.productionStage === "harvested").length;

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={styles.emptyWrapper}>
                <EmptyState
                    title="Nenhuma produção encontrada"
                    description="Para visualizar o andamento das produções, cadastre produtos e acompanhe seus estágios aqui."
                />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <SummaryCards totalArea={totalArea} waiting={waiting} production={productionCount} harvested={harvested} />

            <View style={styles.charts}>
                <StatusDistributionChart productions={items} />
                <StatusQuantityChart productions={items} />
            </View>

            <StatusFilter selected={filter} onSelect={setFilter} />

            <View style={styles.grid}>
                {filtered.map((it) => (
                    <View key={it.id} style={styles.gridItem}>
                        <ProductionCard item={it} />
                    </View>
                ))}
            </View>

            {filtered.length === 0 && (
                <EmptyState
                    title="Nenhuma produção encontrada"
                    description={
                        filter !== "all"
                            ? `Não há produções no estágio "${stageLabels[filter]}".`
                            : "Adicione produções para começar o acompanhamento."
                    }
                    onClearFilter={filter !== "all" ? () => setFilter("all") : undefined}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    container: { padding: 16, gap: 16, backgroundColor: "#F9FAFB", flexGrow: 1 },
    charts: { gap: 16 },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    gridItem: {
        width: "100%",
    },
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        padding: 32,
    },
});
