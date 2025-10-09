import {
    addNotification,
    getFreshNotificationsConfig,
} from "@/src/modules/inventory/infrastructure/services/notificationService";
import { calcTotalQuantity, calcTotalRevenue } from "@/src/modules/sales/application/usecases/calcTotals";
import { Goal } from "@/src/modules/sales/domain/entities/Goal";
import { Item } from "@/src/modules/sales/domain/entities/Item";
import { Sale } from "@/src/modules/sales/domain/entities/Sale";
import {
    addSaleToStorage,
    deleteSaleFromStorage,
    updateSaleInStorage,
} from "@/src/modules/sales/infrastructure/services/saleService";
import { AlertMessage } from "@/src/modules/sales/presentation/components/AlertMessage";
import { EmptyState } from "@/src/modules/sales/presentation/components/EmptyState";
import { SaleFormModal } from "@/src/modules/sales/presentation/components/SaleFormModal";
import { SalesList } from "@/src/modules/sales/presentation/components/SalesList";
import { SummaryCards } from "@/src/modules/sales/presentation/components/SummaryCards";
import type { Item as SharedItem } from "@/src/modules/shared/goal/domain/entities/Item";
import type { Sale as SharedSale } from "@/src/modules/shared/goal/domain/entities/Sale";
import { subscribeGoals, subscribeItems, subscribeSales } from "@/src/modules/shared/goal/infrastructure/goalService";
import { Plus } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type SaleWithGoalFlag = Sale & { hasRelatedGoal?: boolean };
type NotifConfig = { stock: boolean; goals: boolean };

export default function SalesScreen() {
    const [products, setProducts] = useState<Item[]>([]);
    const [sales, setSales] = useState<SaleWithGoalFlag[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<Sale | null>(null);

    const notifCfgRef = useRef<NotifConfig>({ stock: true, goals: true });

    const totalRevenue = calcTotalRevenue(sales);
    const totalQty = calcTotalQuantity(sales);

    useEffect(() => {
        (async () => {
            try {
                const cfg = await getFreshNotificationsConfig();
                notifCfgRef.current = {
                    stock: cfg?.stock ?? true,
                    goals: cfg?.goals ?? true,
                };
            } catch {
                notifCfgRef.current = { stock: true, goals: true };
            }
        })();
    }, []);

    useEffect(() => {
        const unsubGoals = subscribeGoals(setGoals);
        return () => unsubGoals?.();
    }, []);

    useEffect(() => {
        const unsubItems = subscribeItems((sharedItems: SharedItem[]) => {
            const mapped = sharedItems.map((i) => ({
                id: i.id,
                name: i.name,
                farmName: (i as any).farm ?? "",
                quantity: i.quantity ?? 0,
                unit: (i as any).unit ?? "un",
                lastUpdated: i.lastUpdated ?? new Date().toISOString(),
            })) as unknown as Item[];
            setProducts(mapped);
        });
        return () => unsubItems?.();
    }, []);

    useEffect(() => {
        const unsubSales = subscribeSales((sharedSales: SharedSale[]) => {
            const mappedSales: SaleWithGoalFlag[] = sharedSales.map((sale) => ({
                id: sale.id,
                productId: sale.productId,
                productName: sale.productName,
                farmName: sale.farm ?? "",
                quantity: sale.quantity,
                salePrice: sale.salePrice,
                totalValue: sale.totalValue,
                date: sale.date,
            }));
            setSales(mappedSales);
            setLoading(false);
        });
        return () => unsubSales?.();
    }, []);

    useEffect(() => {
        setSales((prev) =>
            prev.map((s) => ({
                ...s,
                hasRelatedGoal: goals.some((g) => g.productId === s.productId),
            }))
        );
    }, [goals]);

    const handleSaveSale = async (sale: Sale, isEdit: boolean) => {
        try {
            let persisted: SaleWithGoalFlag;

            if (isEdit) {
                const updated = await updateSaleInStorage(sale.id, sale);
                persisted = {
                    ...updated,
                    hasRelatedGoal: goals.some((g) => g.productId === updated.productId),
                };
                setSales((prev) => prev.map((s) => (s.id === sale.id ? persisted : s)));
            } else {
                const added = await addSaleToStorage({
                    productId: sale.productId,
                    productName: sale.productName,
                    farmName: sale.farmName,
                    quantity: sale.quantity,
                    salePrice: sale.salePrice,
                    date: sale.date,
                });
                persisted = {
                    ...added,
                    hasRelatedGoal: goals.some((g) => g.productId === added.productId),
                };
                setSales((prev) => [...prev, persisted]);
            }

            const cfg = await getFreshNotificationsConfig();

            if (cfg.goals) {
                const relatedGoal = goals.find((g) => g.productId === persisted.productId);

                if (relatedGoal) {
                    const newProgress = relatedGoal.current + persisted.quantity;
                    const isCompleted = newProgress >= relatedGoal.target;

                    const updatedGoal = {
                        ...relatedGoal,
                        current: newProgress,
                        status: isCompleted ? "completed" : "active",
                        updatedAt: new Date().toISOString(),
                    };
                    await updateSaleInStorage(relatedGoal.id, updatedGoal as any);

                    await addNotification({
                        type: "success",
                        category: "goals",
                        title: isCompleted ? "Meta Atingida!" : "Venda vinculada à meta",
                        message: isCompleted
                            ? `${relatedGoal.title} foi concluída com sucesso (${newProgress}/${relatedGoal.target} ${relatedGoal.unit}).`
                            : `A venda de ${persisted.productName} ajudou no progresso da meta "${relatedGoal.title}" (${newProgress}/${relatedGoal.target} ${relatedGoal.unit}).`,
                    });
                }
            }

            setError("");
        } catch (e: any) {
            setError(e?.message ?? "Erro ao salvar venda.");
        }
    };

    const handleDeleteSale = async (id: string) => {
        try {
            await deleteSaleFromStorage(id);
            setSales((prev) => prev.filter((s) => s.id !== id));
        } catch (e: any) {
            setError(e?.message ?? "Erro ao excluir venda.");
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    const hasProducts = products.length > 0;
    const hasSales = sales.length > 0;

    if (!hasProducts && !hasSales) {
        return (
            <View style={styles.emptyWrapper}>
                <EmptyState
                    title="Antes de começar..."
                    description='Para registrar vendas, cadastre primeiro seus produtos na tela de "Controle de Estoque".'
                />
            </View>
        );
    }

    if (hasProducts && !hasSales) {
        return (
            <View style={styles.emptyWrapper}>
                <EmptyState
                    title="Nenhuma venda registrada"
                    description="Adicione suas primeiras vendas para começar o acompanhamento."
                />
                <Pressable
                    style={[styles.primaryBtn, styles.fullWidthBtn, { marginTop: 24 }]}
                    onPress={() => {
                        setEditingSale(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus size={16} color="#FFF" />
                    <Text style={styles.primaryBtnTxt}>Registrar Venda</Text>
                </Pressable>

                <SaleFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    products={products}
                    onSave={handleSaveSale}
                    editingSale={editingSale}
                />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!!error && <AlertMessage message={error} />}

            <SummaryCards totalRevenue={totalRevenue} totalQuantity={totalQty} totalSales={sales.length} />

            <View style={styles.section}>
                <Pressable
                    style={[styles.primaryBtn, styles.fullWidthBtn]}
                    onPress={() => {
                        setEditingSale(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus size={16} color="#FFF" />
                    <Text style={styles.primaryBtnTxt}>Registrar Venda</Text>
                </Pressable>

                <View style={styles.headerText}>
                    <Text style={styles.h2}>Vendas Registradas</Text>
                    <Text style={styles.sub}>Histórico de vendas realizadas</Text>
                </View>
            </View>

            {sales.length === 0 ? (
                <EmptyState title="Nenhuma venda registrada" description="Ainda não há registros de vendas." />
            ) : (
                <SalesList
                    sales={sales}
                    onEdit={(sale) => {
                        setEditingSale(sale);
                        setIsModalOpen(true);
                    }}
                    onDelete={handleDeleteSale}
                />
            )}

            <SaleFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                products={products}
                onSave={handleSaveSale}
                editingSale={editingSale}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    container: { padding: 16, gap: 24, backgroundColor: "#F9FAFB", flexGrow: 1 },
    section: { gap: 12 },
    headerText: { gap: 2, marginBottom: -10 },
    h2: { fontSize: 20, fontWeight: "700", color: "#111827" },
    sub: { fontSize: 13, color: "#6B7280" },
    primaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#16A34A",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: "#16A34A",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 10,
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
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        padding: 32,
    },
});
