import { addCategory } from "@/src/modules/registrations/application/usecases/addCategory";
import { addFarm } from "@/src/modules/registrations/application/usecases/addFarm";
import { deleteFarm } from "@/src/modules/registrations/application/usecases/deleteFarm";
import { listCategory } from "@/src/modules/registrations/application/usecases/listCategory";
import { updateCategory } from "@/src/modules/registrations/application/usecases/updateCategory";
import { updateFarm } from "@/src/modules/registrations/application/usecases/updateFarm";
import { Category } from "@/src/modules/registrations/domain/entities/Category";
import { Farm } from "@/src/modules/registrations/domain/entities/Farm";
import { deleteCategory, getFarms } from "@/src/modules/registrations/infrastructure/services/storageService";
import { AlertMessage } from "@/src/modules/registrations/presentation/components/AlertMessage";
import { CategoryFormModal } from "@/src/modules/registrations/presentation/components/CategoryFormModal";
import { CategoryList } from "@/src/modules/registrations/presentation/components/CategoryList";
import { FarmFormModal } from "@/src/modules/registrations/presentation/components/FarmFormModal";
import { FarmList } from "@/src/modules/registrations/presentation/components/FarmList";
import { Tabs } from "@/src/modules/registrations/presentation/components/Tabs";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export default function ManageRegistrationsScreen() {
    const [activeTab, setActiveTab] = useState<"farms" | "categories">("farms");
    const [farms, setFarms] = useState<Farm[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
    const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [farmsData, categoriesData] = await Promise.all([getFarms(), listCategory()]);
                setFarms(farmsData);
                setCategories(categoriesData);
                setError("");
            } catch (err: any) {
                setError(err?.message ?? "Falha ao carregar cadastros.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSaveFarm = async (farm: Farm, isEdit: boolean) => {
        try {
            const updated = isEdit ? await updateFarm(farms, farm) : await addFarm(farms, farm);
            setFarms(updated);
            setError("");
        } catch (err: any) {
            setError(err?.message ?? "Erro ao salvar fazenda.");
        }
    };

    const handleSaveCategory = async (category: Category, isEdit: boolean) => {
        try {
            const updated = isEdit
                ? await updateCategory(categories, category)
                : await addCategory(categories, category);
            setCategories(updated);
            setError("");
        } catch (err: any) {
            setError(err?.message ?? "Erro ao salvar categoria.");
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
        <View style={styles.container}>
            {!!error && <AlertMessage message={error} />}

            <Tabs active={activeTab} onChange={setActiveTab} />

            {activeTab === "farms" && (
                <View style={styles.section}>
                    <Pressable
                        style={[styles.primaryBtn, styles.fullWidthBtn]}
                        onPress={() => {
                            setEditingFarm(null);
                            setIsFarmModalOpen(true);
                        }}
                    >
                        <Plus size={16} color="#FFF" />
                        <Text style={styles.primaryBtnTxt}>Nova Fazenda</Text>
                    </Pressable>
                    <View style={styles.headerText}>
                        <Text style={styles.h2}>Fazendas Cadastradas</Text>
                        <Text style={styles.sub}>Gerencie as fazendas da cooperativa</Text>
                    </View>
                    <FarmList
                        farms={farms}
                        onEdit={(farm) => {
                            setEditingFarm(farm);
                            setIsFarmModalOpen(true);
                        }}
                        onDelete={async (id) => {
                            const deleted = await deleteFarm(farms, id);
                            setFarms(deleted);
                        }}
                    />
                </View>
            )}

            {activeTab === "categories" && (
                <View style={styles.section}>
                    <View style={styles.headerText}>
                        <Text style={styles.h2}>Categorias de Produtos</Text>
                        <Text style={styles.sub}>Gerencie as categorias de produtos</Text>
                    </View>

                    <Pressable
                        style={[styles.primaryBtn, styles.fullWidthBtn]}
                        onPress={() => {
                            setEditingCategory(null);
                            setIsCategoryModalOpen(true);
                        }}
                    >
                        <Plus size={16} color="#FFF" />
                        <Text style={styles.primaryBtnTxt}>Nova Categoria</Text>
                    </Pressable>

                    <CategoryList
                        categories={categories}
                        onEdit={(category) => {
                            setEditingCategory(category);
                            setIsCategoryModalOpen(true);
                        }}
                        onDelete={async (id) => {
                            await deleteCategory(id);
                            setCategories((prev) => prev.filter((c) => (c.id === id ? false : true)));
                        }}
                    />
                </View>
            )}

            <FarmFormModal
                isOpen={isFarmModalOpen}
                onClose={() => setIsFarmModalOpen(false)}
                onSave={handleSaveFarm}
                editingFarm={editingFarm}
            />

            <CategoryFormModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSave={handleSaveCategory}
                editingCategory={editingCategory}
            />
        </View>
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

    section: { gap: 16, marginBottom: 24 },

    headerText: {
        gap: 2,
        marginBottom: -10,
    },
    h2: { fontSize: 20, fontWeight: "700", color: "#111827" },
    sub: { fontSize: 13, color: "#6B7280" },

    primaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#16A34A",
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: "#16A34A",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    fullWidthBtn: {
        width: "100%",
        alignSelf: "center",
    },

    primaryBtnTxt: { color: "#FFF", fontWeight: "700", fontSize: 15, letterSpacing: 0.3 },
});
