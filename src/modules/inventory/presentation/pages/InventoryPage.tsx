import { addItem } from "@/src/modules/inventory/application/usecases/addItem";
import { deleteItem } from "@/src/modules/inventory/application/usecases/deleteItem";
import { updateItem } from "@/src/modules/inventory/application/usecases/updateItem";
import {
    addNotification,
    getFreshNotificationsConfig,
} from "@/src/modules/inventory/infrastructure/services/notificationService";
import {
    subscribeCategories,
    subscribeFarms,
} from "@/src/modules/inventory/infrastructure/services/referenceDataService";
import { AlertMessage } from "@/src/modules/inventory/presentation/components/AlertMessage";
import { EmptyState } from "@/src/modules/inventory/presentation/components/EmptyState";
import { FilterButtons } from "@/src/modules/inventory/presentation/components/FilterButtons";
import { ItemFormModal } from "@/src/modules/inventory/presentation/components/ItemFormModal";
import { ItemList } from "@/src/modules/inventory/presentation/components/ItemTable";
import { SummaryCards } from "@/src/modules/inventory/presentation/components/SummaryCards";
import { getStockStatus } from "@/src/modules/inventory/utils/getStockStatus";
import { Goal, Sale } from "@/src/modules/shared/goal";
import { subscribeGoals, subscribeItems, subscribeSales } from "@/src/modules/shared/goal/infrastructure/goalService";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Item } from "../../domain/entities/Item";

type NotifConfig = { stock: boolean; goals: boolean };

export default function InventoryScreen() {
    const [categories, setCategories] = useState<string[]>([]);
    const [farms, setFarms] = useState<string[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    const salesRef = useRef<Sale[]>([]);
    const goalsRef = useRef<Goal[]>([]);
    const notifCfgRef = useRef<NotifConfig>({ stock: true, goals: true });

    const units = ["kg", "ton", "sc", "un"];

    useEffect(() => {
        salesRef.current = sales;
    }, [sales]);

    useEffect(() => {
        goalsRef.current = goals;
    }, [goals]);

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
        let unsubCats: undefined | (() => void);
        let unsubFarms: undefined | (() => void);
        let unsubItems: undefined | (() => void);
        let unsubSales: undefined | (() => void);
        let unsubGoals: undefined | (() => void);

        try {
            unsubCats = subscribeCategories((cats) => setCategories(cats.map((c) => c.name)));
            unsubFarms = subscribeFarms((fs) => setFarms(fs.map((f) => f.name)));

            unsubSales = subscribeSales(setSales);
            unsubGoals = subscribeGoals(setGoals);
            unsubItems = subscribeItems((its) => {
                const currentSales = salesRef.current;
                const currentGoals = goalsRef.current;

                const mapped = its.map((item) => {
                    const productSales = currentSales.filter((s) => s.productId === item.id);
                    const hasRelatedGoal = currentGoals.some((g) => g.productId === item.id);
                    return { ...item, sales: productSales, hasRelatedGoal } as Item;
                });

                setItems(mapped);
            });
        } catch (e: any) {
            setError(e.message ?? "Erro ao assinar dados em tempo real");
        } finally {
            setLoading(false);
        }

        return () => {
            unsubCats?.();
            unsubFarms?.();
            unsubItems?.();
            unsubSales?.();
            unsubGoals?.();
        };
    }, []);

    const filteredItems = useMemo(
        () => (selectedCategory === "all" ? items : items.filter((i) => i.category === selectedCategory)),
        [items, selectedCategory]
    );

    const lowStockItems = items.filter((i) => getStockStatus(i).status === "low");
    const totalValue = items.reduce((sum, i) => sum + i.quantity * i.costPrice, 0);

    const handleSave = async (item: Item, isEdit: boolean) => {
        try {
            let persisted: Item | undefined;

            if (isEdit) {
                const updated = await updateItem(items, item);
                setItems(updated);
                persisted = updated.find((i) => i.id === item.id);
            } else {
                const added = await addItem(items, item);
                setItems(added);
                persisted = added.find((i) => !items.some((old) => old.id === i.id)) ?? added[added.length - 1];
            }

            if (persisted && getStockStatus(persisted).status === "low" && notifCfgRef.current.stock) {
                await addNotification({
                    type: "warning",
                    category: "stock",
                    title: `Estoque Baixo - ${persisted.name}`,
                    message: `O estoque de ${persisted.name} está abaixo do mínimo (${persisted.quantity}/${persisted.minStock})`,
                });
            }

            setError("");
        } catch (e: any) {
            setError(e.message ?? "Erro ao salvar item");
        }
    };

    useEffect(() => {
        if (selectedCategory !== "all" && !categories.includes(selectedCategory)) {
            setSelectedCategory("all");
        }
    }, [categories, selectedCategory]);

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

            <View>
                <View className="filterRow" style={styles.filterRow}>
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
    btnPrimaryTxt: { color: "#FFF", fontWeight: "700", textAlign: "center", fontSize: 15, letterSpacing: 0.3 },
    fullWidthBtn: { width: "100%", alignSelf: "center", marginTop: 6 },
});
