import { Plus } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Goal } from "@/src/modules/goals/domain/entities/Goal";
import { Item } from "@/src/modules/goals/domain/entities/Item";

import { AlertMessage } from "@/src/modules/goals/presentation/components/AlertMessage";
import { EmptyState } from "@/src/modules/goals/presentation/components/EmptyState";
import { FilterButtons } from "@/src/modules/goals/presentation/components/FilterButtons";
import { GoalCard } from "@/src/modules/goals/presentation/components/GoalCard";
import { GoalFormModal } from "@/src/modules/goals/presentation/components/GoalFormModal";
import { SummaryCards } from "@/src/modules/goals/presentation/components/SummaryCards";

import {
    createGoal,
    deleteGoalFirestore,
    fetchGoals,
    updateGoalFirestore,
} from "@/src/modules/goals/infrastructure/services/goalsService";
import { getItemsFromStorage } from "@/src/modules/shared/goal/infrastructure/goalService";

export default function GoalsScreen() {
    const [selectedType, setSelectedType] = useState<"all" | "sales" | "production">("all");
    const [goals, setGoals] = useState<Goal[]>([]);
    const [products, setProducts] = useState<Item[]>([]);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);

    const typeLabels: Record<"sales" | "production", string> = {
        sales: "Vendas",
        production: "Produção",
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [itemsData, goalsData] = await Promise.all([getItemsFromStorage(), fetchGoals()]);
                setProducts(itemsData as unknown as Item[]);
                setGoals(goalsData as unknown as Goal[]);
            } catch (err: any) {
                setError(err.message ?? "Falha ao carregar dados.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filteredGoals = useMemo(
        () => (selectedType === "all" ? goals : goals.filter((g) => g.type === selectedType)),
        [goals, selectedType]
    );

    const completedGoals = goals.filter((g) => g.status === "completed").length;
    const activeGoals = goals.filter((g) => g.status === "active").length;
    const overdueGoals = goals.filter((g) => g.status === "overdue").length;

    async function handleSave(goal: Goal, isEdit: boolean) {
        try {
            if (isEdit) {
                await updateGoalFirestore(goal);
            } else {
                await createGoal(goal);
            }

            const fresh = await fetchGoals();
            setGoals(fresh);
            setError("");
            setIsModalOpen(false);
            setEditingGoal(null);
        } catch (e: any) {
            setError(e.message ?? "Erro ao salvar meta");
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteGoalFirestore(id);
            const fresh = await fetchGoals();
            setGoals(fresh);
        } catch (e: any) {
            setError(e.message ?? "Erro ao excluir meta");
        }
    }

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    if (products.length === 0) {
        return (
            <View style={styles.emptyWrapper}>
                <EmptyState
                    title="Nenhum produto encontrado"
                    description="Para criar metas, cadastre produtos na tela de Controle de Estoque."
                />
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
                editingGoal={editingGoal}
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
    primaryBtnTxt: { color: "#FFF", fontWeight: "700", fontSize: 15, letterSpacing: 0.3 },
    fullWidthBtn: { width: "100%", alignSelf: "center", marginTop: 6 },
    grid: { gap: 12 },
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        padding: 32,
    },
});
