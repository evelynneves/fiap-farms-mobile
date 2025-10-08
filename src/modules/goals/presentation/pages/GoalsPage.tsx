import { Goal } from "@/src/modules/goals/domain/entities/Goal";
import type { Item as GoalsItem } from "@/src/modules/goals/domain/entities/Item";
import { Item } from "@/src/modules/goals/domain/entities/Item";
import {
    createGoal,
    deleteGoalFirestore,
    fetchGoals,
    updateGoalFirestore,
} from "@/src/modules/goals/infrastructure/services/goalsService";
import {
    addNotification,
    getFreshNotificationsConfig,
} from "@/src/modules/goals/infrastructure/services/notificationService";
import { AlertMessage } from "@/src/modules/goals/presentation/components/AlertMessage";
import { EmptyState } from "@/src/modules/goals/presentation/components/EmptyState";
import { FilterButtons } from "@/src/modules/goals/presentation/components/FilterButtons";
import { GoalCard } from "@/src/modules/goals/presentation/components/GoalCard";
import { GoalFormModal } from "@/src/modules/goals/presentation/components/GoalFormModal";
import { SummaryCards } from "@/src/modules/goals/presentation/components/SummaryCards";
import { recalculateGoalsProgress } from "@/src/modules/shared/goal";
import type { Item as SharedItem } from "@/src/modules/shared/goal/domain/entities/Item";
import { subscribeGoals, subscribeItems, subscribeSales } from "@/src/modules/shared/goal/infrastructure/goalService";
import { Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GoalsScreen() {
    const [selectedType, setSelectedType] = useState<"all" | "sales" | "production">("all");
    const [goals, setGoals] = useState<Goal[]>([]);
    const [products, setProducts] = useState<Item[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);

    const typeLabels: Record<"sales" | "production", string> = { sales: "Vendas", production: "Produção" };
    const isValidUnit = (u: any): u is Item["unit"] => ["kg", "g", "un", "L", "m"].includes(u);

    const salesRef = useRef<any[]>([]);
    const productsRef = useRef<Item[]>([]);

    useEffect(() => {
        salesRef.current = sales;
    }, [sales]);

    useEffect(() => {
        productsRef.current = products;
    }, [products]);

    const mapSharedToGoalsItem = (it: SharedItem): GoalsItem => ({
        id: it.id,
        name: it.name,
        farm: (it as any).farm ?? "",
        quantity: it.quantity ?? 0,
        unit: isValidUnit(it.unit) ? it.unit : "un",
        category: (it as any).category ?? "",
        minStock: (it as any).minStock ?? 0,
        costPrice: (it as any).costPrice ?? 0,
        lastUpdated: it.lastUpdated ?? new Date().toISOString(),
    });

    const subscribeData = useCallback(() => {
        setLoading(true);

        const unsubItems = subscribeItems((its) => {
            setProducts(its.map(mapSharedToGoalsItem));
        });

        const unsubSales = subscribeSales((ss) => setSales(ss));
        const unsubGoals = subscribeGoals(async (goalsSnap) => {
            try {
                const recalculated = await recalculateGoalsProgress(goalsSnap, {
                    getSales: async () => salesRef.current,
                    getItems: async () => productsRef.current,
                });
                setGoals(recalculated);
            } catch (e: any) {
                setError(e.message ?? "Erro ao recalcular metas");
            }
        });

        setLoading(false);

        return () => {
            unsubItems?.();
            unsubSales?.();
            unsubGoals?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const unsub = subscribeData();
        return () => unsub?.();
    }, [subscribeData]);

    const filteredGoals = useMemo(
        () => (selectedType === "all" ? goals : goals.filter((g) => g.type === selectedType)),
        [goals, selectedType]
    );

    const completedGoals = goals.filter((g) => g.status === "completed").length;
    const activeGoals = goals.filter((g) => g.status === "active").length;
    const overdueGoals = goals.filter((g) => g.status === "overdue").length;

    async function handleSave(goal: Goal, isEdit: boolean) {
        try {
            const prevCompleted = new Set(goals.filter((g) => g.status === "completed").map((g) => g.id));

            if (isEdit) await updateGoalFirestore(goal);
            else await createGoal(goal);

            const fresh = await fetchGoals();
            const recalculated = await recalculateGoalsProgress(fresh, {
                getSales: async () => salesRef.current,
                getItems: async () => productsRef.current,
            });
            setGoals(recalculated);

            const config = await getFreshNotificationsConfig();
            const nowCompleted = recalculated.filter((g) => g.status === "completed");
            if (config.goals) {
                for (const g of nowCompleted) {
                    if (!prevCompleted.has(g.id)) {
                        await addNotification({
                            type: "success",
                            category: "goals",
                            title: "Meta Atingida!",
                            message: `${g.title} foi concluída com sucesso (${g.current}/${g.target} ${g.unit})`,
                        });
                    }
                }
            }
            setError("");
            setIsModalOpen(false);
            setEditingGoal(null);
        } catch (e: any) {
            setError(e?.message ?? "Erro ao salvar meta");
        }
    }

    async function handleDelete(id: string) {
        try {
            if (!id) throw new Error("ID da meta ausente");
            await deleteGoalFirestore(id);
        } catch (e: any) {
            setError(e?.message ?? "Erro ao excluir meta");
        }
    }

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!!error && <AlertMessage tone="error" message={error} />}

            <SummaryCards active={activeGoals} completed={completedGoals} overdue={overdueGoals} />

            <View>
                <TouchableOpacity
                    style={[styles.primaryBtn, styles.fullWidthBtn]}
                    onPress={() => {
                        setEditingGoal(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus size={16} color="#FFF" />
                    <Text style={styles.primaryBtnTxt}>Nova Meta</Text>
                </TouchableOpacity>
                <View style={styles.filterRow}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filters}
                    >
                        <FilterButtons selected={selectedType} onSelect={setSelectedType} />
                    </ScrollView>
                </View>
            </View>

            <View style={styles.grid}>
                {filteredGoals.map((goal) => (
                    <View key={goal.id} style={{ flex: 1 }}>
                        <GoalCard
                            goal={goal}
                            onEdit={(g) => {
                                setEditingGoal(g);
                                setIsModalOpen(true);
                            }}
                            onDelete={(id) => {
                                void handleDelete(id);
                            }}
                        />
                    </View>
                ))}
            </View>

            {filteredGoals.length === 0 && (
                <EmptyState
                    title="Nenhuma meta encontrada"
                    description={
                        selectedType !== "all"
                            ? `Não há metas de ${typeLabels[selectedType]}.`
                            : "Crie sua primeira meta para começar o acompanhamento."
                    }
                    onClearFilter={selectedType !== "all" ? () => setSelectedType("all") : undefined}
                />
            )}

            <GoalFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingGoal={editingGoal ?? undefined}
                products={products}
                goals={goals}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    container: { padding: 16, gap: 12 },
    filterRow: { flexDirection: "row", alignItems: "center" },
    filters: { flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 16 },
    primaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#16A34A",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: "#16A34A",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    primaryBtnTxt: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 15,
        letterSpacing: 0.3,
    },
    fullWidthBtn: {
        width: "100%",
        alignSelf: "center",
        marginTop: 6,
    },
    grid: { gap: 12 },
});
