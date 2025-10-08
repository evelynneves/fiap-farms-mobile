import { calcTotalQuantity, calcTotalRevenue } from "@/src/modules/sales/application/usecases/calcTotals";
import { Goal } from "@/src/modules/sales/domain/entities/Goal";
import { Item } from "@/src/modules/sales/domain/entities/Item";
import { Sale } from "@/src/modules/sales/domain/entities/Sale";
import {
    addSaleToStorage,
    deleteSaleFromStorage,
    getSalesFromStorage,
    updateSaleInStorage,
} from "@/src/modules/sales/infrastructure/services/saleService";
import { AlertMessage } from "@/src/modules/sales/presentation/components/AlertMessage";
import { SaleFormModal } from "@/src/modules/sales/presentation/components/SaleFormModal";
import { SalesList } from "@/src/modules/sales/presentation/components/SalesList";
import { SummaryCards } from "@/src/modules/sales/presentation/components/SummaryCards";
import { getGoalsFromStorage, getItemsFromStorage } from "@/src/modules/shared/goal/infrastructure/goalService";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function SalesScreen() {
    const [products, setProducts] = useState<Item[]>([]);
    const [sales, setSales] = useState<(Sale & { hasRelatedGoal?: boolean })[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<Sale | null>(null);

    const totalRevenue = calcTotalRevenue(sales);
    const totalQty = calcTotalQuantity(sales);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [items, salesData, goalsData] = await Promise.all([
                    getItemsFromStorage(),
                    getSalesFromStorage(),
                    getGoalsFromStorage(),
                ]);

                const salesWithFlag = salesData.map((sale) => ({
                    ...sale,
                    hasRelatedGoal: goalsData.some((goal) => goal.productId === sale.productId),
                }));

                setProducts(items as unknown as Item[]);
                setGoals(goalsData as unknown as Goal[]);
                setSales(salesWithFlag);
                setError("");
            } catch (err: any) {
                setError(err?.message ?? "Falha ao carregar vendas.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSaveSale = async (sale: Sale, isEdit: boolean) => {
        try {
            if (isEdit) {
                const updated = await updateSaleInStorage(sale.id, sale);
                const updatedWithFlag = {
                    ...updated,
                    hasRelatedGoal: goals.some((g) => g.productId === updated.productId),
                };
                setSales((prev) => prev.map((s) => (s.id === updated.id ? updatedWithFlag : s)));
            } else {
                const added = await addSaleToStorage({
                    productId: sale.productId,
                    productName: sale.productName,
                    farmName: sale.farmName,
                    quantity: sale.quantity,
                    salePrice: sale.salePrice,
                    date: sale.date,
                });
                const addedWithFlag = {
                    ...added,
                    hasRelatedGoal: goals.some((g) => g.productId === added.productId),
                };
                setSales((prev) => [...prev, addedWithFlag]);
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

            <SalesList
                sales={sales}
                onEdit={(sale) => {
                    setEditingSale(sale);
                    setIsModalOpen(true);
                }}
                onDelete={handleDeleteSale}
            />

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
    container: {
        padding: 16,
        gap: 24,
        backgroundColor: "#F9FAFB",
        flexGrow: 1,
    },
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
});
