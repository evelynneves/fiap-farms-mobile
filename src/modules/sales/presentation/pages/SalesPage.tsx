import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Plus } from "lucide-react-native";

import { Goal } from "@/src/modules/sales/domain/entities/Goal";
import { Item } from "@/src/modules/sales/domain/entities/Item";
import { Sale } from "@/src/modules/sales/domain/entities/Sale";

import { calcTotalQuantity, calcTotalRevenue } from "@/src/modules/sales/application/usecases/calcTotals";
import {
    addSaleToStorage,
    deleteSaleFromStorage,
    getSalesFromStorage,
    updateSaleInStorage,
} from "@/src/modules/sales/infrastructure/services/saleService";

import { AlertMessage } from "@/src/modules/sales/presentation/components/AlertMessage";
import { EmptyState } from "@/src/modules/sales/presentation/components/EmptyState";
import { SaleFormModal } from "@/src/modules/sales/presentation/components/SaleFormModal";
import { SalesList } from "@/src/modules/sales/presentation/components/SalesList";
import { SummaryCards } from "@/src/modules/sales/presentation/components/SummaryCards";
import { getGoalsFromStorage, getItemsFromStorage } from "@/src/modules/shared/goal";

export default function SalesScreen() {
    const [products, setProducts] = useState<Item[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            } catch (err: any) {
                setError(err.message ?? "Erro ao carregar vendas");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSaveSale = async (sale: Sale, isEdit: boolean) => {
        try {
            if (isEdit) {
                await updateSaleInStorage(sale.id, sale);
            } else {
                await addSaleToStorage({
                    productId: sale.productId,
                    productName: sale.productName,
                    farmName: sale.farmName,
                    quantity: sale.quantity,
                    salePrice: sale.salePrice,
                    date: sale.date,
                });
            }

            const [salesData, itemsData, goalsData] = await Promise.all([
                getSalesFromStorage(),
                getItemsFromStorage(),
                getGoalsFromStorage(),
            ]);

            const salesWithFlag = salesData.map((s) => ({
                ...s,
                hasRelatedGoal: goalsData.some((g) => g.productId === s.productId),
            }));

            setSales(salesWithFlag);
            setProducts(itemsData as unknown as Item[]);
            setGoals(goalsData as unknown as Goal[]);
            setError("");
            setIsModalOpen(false);
            setEditingSale(null);
        } catch (e: any) {
            setError(e.message ?? "Erro ao salvar venda");
        }
    };

    const handleDeleteSale = async (id: string) => {
        try {
            await deleteSaleFromStorage(id);
            setSales((prev) => prev.filter((s) => s.id !== id));
        } catch (e: any) {
            setError(e.message ?? "Erro ao excluir venda");
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#16A34A" />
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
    primaryBtnTxt: { color: "#FFF", fontWeight: "700", fontSize: 15, letterSpacing: 0.3 },
    fullWidthBtn: { width: "100%", alignSelf: "center", marginTop: 6 },
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        padding: 32,
    },
});
