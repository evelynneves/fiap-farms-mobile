import { type Href } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { DashboardStat } from "@/src/modules/home/domain/entities/DashboardStat";
import { getDashboardStats } from "@/src/modules/home/infrastructure/services/dashboardService";
import { DashCards } from "@/src/modules/home/presentation/components/DashCards";
import StatsCard from "@/src/modules/home/presentation/components/StatsCard";
import { AlertMessage } from "@/src/modules/settings/presentation/components/AlertMessage";
import { BarChart3, DollarSign, Package, Settings, Sprout, Tag, Target } from "lucide-react-native";

type HomeCard = {
    id: string;
    href: Href;
    icon: React.ReactNode;
    title: string;
    description: string;
};

export default function HomeScreen() {
    const [stats, setStats] = useState<DashboardStat[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const statsData = await getDashboardStats();
                setStats(statsData);
                setError("");
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err: any) {
                setError("Falha ao carregar dados da Home. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const cards: HomeCard[] = [
        {
            id: "registrations",
            href: "/(logged)/registrations" as const,
            icon: <Tag size={22} color="#16A34A" />,
            title: "Gerenciar Cadastros",
            description: "Fazendas e categorias",
        },
        {
            id: "inventory",
            href: "/(logged)/inventory" as const,
            icon: <Package size={22} color="#16A34A" />,
            title: "Controle de Estoque",
            description: "Gestão de inventário",
        },
        {
            id: "sales",
            href: "/(logged)/sales" as const,
            icon: <DollarSign size={22} color="#16A34A" />,
            title: "Registrar Vendas",
            description: "Controle de vendas",
        },
        {
            id: "production-dashboard",
            href: "/(logged)/production-dashboard" as const,
            icon: <Sprout size={22} color="#16A34A" />,
            title: "Dashboard Produção",
            description: "Status da produção agrícola",
        },
        {
            id: "sales-dashboard",
            href: "/(logged)/sales-dashboard" as const,
            icon: <BarChart3 size={22} color="#16A34A" />,
            title: "Dashboard Vendas",
            description: "Análise de vendas e lucros",
        },
        {
            id: "goals",
            href: "/(logged)/goals" as const,
            icon: <Target size={22} color="#16A34A" />,
            title: "Metas",
            description: "Acompanhamento de objetivos",
        },
        {
            id: "config",
            href: "/(logged)/settings" as const,
            icon: <Settings size={22} color="#16A34A" />,
            title: "Configurações",
            description: "Perfil e preferências",
        },
    ];

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!!error && <AlertMessage type="error" message={error} />}

            <View style={styles.statsGrid}>
                {stats.map((s, i) => (
                    <StatsCard key={i} stat={s} />
                ))}
            </View>

            <Text style={styles.section}>Aplicações</Text>
            <DashCards cards={cards.filter((c) => c.id !== "config")} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    container: { paddingBottom: 24 },
    statsGrid: { paddingHorizontal: 16, gap: 12, marginTop: 12 },
    section: {
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
});
