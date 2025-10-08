import { addItem } from "@/src/modules/inventory/application/usecases/addItem";
import { deleteItem } from "@/src/modules/inventory/application/usecases/deleteItem";
import { updateItem } from "@/src/modules/inventory/application/usecases/updateItem";
import { Item } from "@/src/modules/inventory/domain/entities/Item";
import {
    addNotification,
    getFreshNotificationsConfig,
} from "@/src/modules/inventory/infrastructure/services/notificationService";
import {
    getCategoriesFromStorage,
    getFarmsFromStorage,
} from "@/src/modules/inventory/infrastructure/services/referenceDataService";
import { AlertMessage } from "@/src/modules/inventory/presentation/components/AlertMessage";
import { EmptyState } from "@/src/modules/inventory/presentation/components/EmptyState";
import { FilterButtons } from "@/src/modules/inventory/presentation/components/FilterButtons";
import { ItemFormModal } from "@/src/modules/inventory/presentation/components/ItemFormModal";
import { ItemList } from "@/src/modules/inventory/presentation/components/ItemTable";
import { SummaryCards } from "@/src/modules/inventory/presentation/components/SummaryCards";
import { getStockStatus } from "@/src/modules/inventory/utils/getStockStatus";
import { Sale } from "@/src/modules/shared/goal";
import {
    getGoalsFromStorage,
    getItemsFromStorage,
    getSalesFromStorage,
} from "@/src/modules/shared/goal/infrastructure/goalService";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function InventoryScreen() {
    const [categories, setCategories] = useState<string[]>([]);
    const [farms, setFarms] = useState<string[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    const units = ["kg", "ton", "sc", "un"];

    const filteredItems = useMemo(
        () => (selectedCategory === "all" ? items : items.filter((i) => i.category === selectedCategory)),
        [items, selectedCategory]
    );

    const lowStockItems = items.filter((i) => getStockStatus(i).status === "low");
    const totalValue = items.reduce((sum, i) => sum + i.quantity * i.costPrice, 0);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [cats, fs, its, sales, goals] = await Promise.all([
                    getCategoriesFromStorage(),
                    getFarmsFromStorage(),
                    getItemsFromStorage(),
                    getSalesFromStorage(),
                    getGoalsFromStorage(),
                ]);

                const enriched: Item[] = (its as unknown as Item[]).map((item) => {
                    const productSales: Sale[] = sales.filter((s) => s.productId === item.id);
                    const hasRelatedGoal = goals.some((g) => g.productId === item.id);
                    return { ...item, sales: productSales, hasRelatedGoal };
                });

                setCategories(cats.map((c) => c.name));
                setFarms(fs.map((f) => f.name));
                setItems(enriched);
                setError("");
            } catch (e: any) {
                setError(e.message ?? "Erro ao carregar inventário");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSave = async (item: Item, isEdit: boolean) => {
        try {
            if (isEdit) {
                const updated = await updateItem(items, item);
                setItems(updated);
                if (getStockStatus(item).status === "low") {
                    await addNotification({
                        type: "warning",
                        category: "stock",
                        title: `Estoque Baixo - ${item.name}`,
                        message: `O estoque de ${item.name} está abaixo do mínimo (${item.quantity}/${item.minStock})`,
                    });
                }
            } else {
                const added = await addItem(items, item);
                setItems(added);

                const config = await getFreshNotificationsConfig();
                if (getStockStatus(item).status === "low" && config.stock) {
                    await addNotification({
                        type: "warning",
                        category: "stock",
                        title: `Estoque Baixo - ${item.name}`,
                        message: `O estoque de ${item.name} está abaixo do mínimo (${item.quantity}/${item.minStock})`,
                    });
                }
            }
            setError("");
        } catch (e: any) {
            setError(e.message ?? "Erro ao salvar item");
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!!error && <AlertMessage message={error} />}

            <SummaryCards totalItems={items.length} lowStockCount={lowStockItems.length} totalValue={totalValue} />
            <Pressable
                onPress={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                }}
                style={[styles.btn, styles.btnPrimary, styles.fullWidthBtn]}
            >
                <Text style={styles.btnPrimaryTxt}>+ Adicionar Item</Text>
            </Pressable>
            <View style={styles.controls}>
                <View style={styles.filterRow}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filters}
                    >
                        <FilterButtons
                            categories={categories}
                            selected={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </ScrollView>

                    {categories.length > 3 && (
                        <View style={styles.scrollHint}>
                            <Text style={styles.scrollHintTxt}>›</Text>
                        </View>
                    )}
                </View>
            </View>

            <ItemList
                items={filteredItems}
                onEdit={(item) => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                }}
                onDelete={async (id) => {
                    const remaining = await deleteItem(items, id);
                    setItems(remaining);
                }}
            />

            {filteredItems.length === 0 && (
                <EmptyState
                    title="Nenhum item encontrado"
                    description={
                        selectedCategory !== "all"
                            ? `Não há itens na categoria "${selectedCategory}".`
                            : "Adicione itens ao estoque para começar o controle."
                    }
                    onClearFilter={selectedCategory !== "all" ? () => setSelectedCategory("all") : undefined}
                />
            )}

            <ItemFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingItem={editingItem}
                categories={categories}
                farms={farms}
                units={units}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    container: { padding: 16, gap: 12 },
    filterRow: { flexDirection: "row", alignItems: "center" },
    filters: { flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 16 },
    scrollHint: {
        backgroundColor: "#E5E7EB",
        width: 24,
        height: 24,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: -6,
    },
    scrollHintTxt: { fontSize: 18, color: "#4B5563", fontWeight: "700", marginTop: -2 },
    btn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, marginBottom: 20 },
    btnPrimary: {
        backgroundColor: "#16A34A",
        shadowColor: "#16A34A",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    btnPrimaryTxt: {
        color: "#FFF",
        fontWeight: "700",
        textAlign: "center",
        fontSize: 15,
        letterSpacing: 0.3,
    },
    fullWidthBtn: {
        width: "100%",
        alignSelf: "center",
        marginTop: 6,
    },
});
