import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import NotificationsButton from "@/src/modules/settings/presentation/components/NotificationsButton";
import { useAuth } from "@/src/modules/shared/contexts/useAuthContext";
import { useAutoLogout } from "@/src/modules/shared/hooks/useAutoLogout";

import AppHeaderTitle from "@/src/modules/shared/presentation/components/AppHeaderTitle";
import { DrawerContentScrollView, type DrawerContentComponentProps } from "@react-navigation/drawer";
import {
    BarChart3,
    DollarSign,
    House as Home,
    LogOut,
    Package,
    Settings,
    Sprout,
    Tag,
    Target,
    Users,
} from "lucide-react-native";

const COLORS = {
    drawerBg: "#F5FBF7",
    text: "#1F2937",
    textMuted: "#6B7280",
    active: "#16A34A",
    activeBg: "#E7F6EE",
    divider: "#E5E7EB",
    danger: "#DC2626",
};

type SimpleRoute =
    | "home"
    | "registrations"
    | "inventory"
    | "sales"
    | "production-dashboard"
    | "sales-dashboard"
    | "goals"
    | "settings";

type RouteName =
    | "home/index"
    | "registrations/index"
    | "inventory/index"
    | "sales/index"
    | "production-dashboard/index"
    | "sales-dashboard/index"
    | "goals/index"
    | "settings/index";

const HEADER: Record<RouteName, { title: string; subtitle?: string; icon?: React.ReactNode }> = {
    "home/index": {
        title: "Dashboard",
        subtitle: "Visão geral da cooperativa",
    },
    "registrations/index": {
        title: "Cadastros",
        subtitle: "Fazendas e categorias",
    },
    "inventory/index": {
        title: "Estoque",
        subtitle: "Gestão de inventário",
    },
    "sales/index": {
        title: "Vendas",
        subtitle: "Registro e controle",
    },
    "production-dashboard/index": {
        title: "Dashboard de Produção",
        subtitle: "Status da produção",
    },
    "sales-dashboard/index": {
        title: "Dashboard de Vendas",
        subtitle: "Receita e lucratividade",
    },
    "goals/index": {
        title: "Metas",
        subtitle: "Acompanhamento de objetivos",
    },
    "settings/index": {
        title: "Configurações",
        subtitle: "Perfil e preferências",
    },
};

const MAIN_ITEMS: {
    name: RouteName;
    label: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
    { name: "home/index", label: "Início", Icon: Home },
    { name: "registrations/index", label: "Gerenciar Cadastros", Icon: Tag },
    { name: "inventory/index", label: "Controle de Estoque", Icon: Package },
    { name: "sales/index", label: "Registrar Vendas", Icon: DollarSign },
    { name: "production-dashboard/index", label: "Dashboard Produção", Icon: Sprout },
    { name: "sales-dashboard/index", label: "Dashboard Vendas", Icon: BarChart3 },
    { name: "goals/index", label: "Metas", Icon: Target },
];

const FOOTER_ITEMS: {
    name: RouteName;
    label: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [{ name: "settings/index", label: "Configurações", Icon: Settings }];

function HeaderRight() {
    return (
        <View style={styles.rightWrap}>
            <NotificationsButton />
            <View style={styles.onlinePill}>
                <Users size={14} color={COLORS.active} />
                <Text style={styles.onlineTxt}>Online</Text>
            </View>
        </View>
    );
}

function CustomDrawerContent(props: DrawerContentComponentProps & { onLogout: () => void }) {
    const { state, navigation } = props;
    const activeRoute = state.routes[state.index]?.name as RouteName | undefined;

    const renderItem = (
        name: RouteName,
        label: string,
        Icon: React.ComponentType<{ size?: number; color?: string }>
    ) => {
        const focused = activeRoute === name;
        return (
            <Pressable
                key={name}
                onPress={() => navigation.navigate(name as never)}
                style={({ pressed }) => [
                    styles.item,
                    focused && styles.itemActive,
                    pressed && !focused && { opacity: 0.75 },
                ]}
            >
                <Icon size={20} color={focused ? COLORS.active : COLORS.text} />
                <Text style={[styles.itemLabel, focused && styles.itemLabelActive]}>{label}</Text>
            </Pressable>
        );
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
            <View style={styles.section}>{MAIN_ITEMS.map((it) => renderItem(it.name, it.label, it.Icon))}</View>

            <View style={styles.footer}>
                <View style={[styles.section, { marginBottom: 8 }]}>
                    {FOOTER_ITEMS.map((it) => renderItem(it.name, it.label, it.Icon))}
                </View>

                <Pressable onPress={props.onLogout} style={styles.item}>
                    <LogOut size={20} color={COLORS.danger} />
                    <Text style={[styles.itemLabel, { color: COLORS.danger }]}>Sair</Text>
                </Pressable>
            </View>
        </DrawerContentScrollView>
    );
}

export default function LoggedLayout() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    useAutoLogout();

    useEffect(() => {
        if (!loading && !user) router.replace("/(unlogged)/login");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user]);

    if (loading || (!user && !loading)) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={COLORS.active} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <Drawer
                    drawerContent={(p) => <CustomDrawerContent {...p} onLogout={logout} />}
                    screenOptions={({ route }) => {
                        const name = route.name as SimpleRoute;
                        const headerCfg = HEADER[name] ?? HEADER["home/index"];
                        return {
                            headerShown: true,
                            headerStyle: { backgroundColor: "#FFFFFF", height: 80 },
                            headerShadowVisible: false,
                            headerTintColor: COLORS.text,
                            headerTitle: () => <AppHeaderTitle title={headerCfg.title} subtitle={headerCfg.subtitle} />,
                            headerTitleAlign: "left",
                            headerRight: () => <HeaderRight />,
                            headerRightContainerStyle: {
                                alignItems: "center",
                                height: "100%",
                                paddingBottom: Platform.OS === "android" ? 25 : 0,
                                paddingRight: 8,
                            },
                            headerLeftContainerStyle: {
                                alignItems: "center",
                                height: "100%",
                                paddingBottom: Platform.OS === "android" ? 25 : 0,
                                paddingLeft: 8,
                            },
                            drawerStyle: {
                                backgroundColor: COLORS.drawerBg,
                                width: 280,
                            },
                            drawerActiveTintColor: COLORS.active,
                            drawerInactiveTintColor: COLORS.text,
                            drawerLabelStyle: { fontWeight: "700" },
                            drawerItemStyle: { borderRadius: 8 },
                        };
                    }}
                >
                    <Drawer.Screen name="home" options={{ title: "Início" }} />
                    <Drawer.Screen name="registrations" options={{ title: "Cadastros" }} />
                    <Drawer.Screen name="inventory" options={{ title: "Estoque" }} />
                    <Drawer.Screen name="sales" options={{ title: "Vendas" }} />
                    <Drawer.Screen name="production-dashboard" options={{ title: "Dashboard de Produção" }} />
                    <Drawer.Screen name="sales-dashboard" options={{ title: "Dashboard de Vendas" }} />
                    <Drawer.Screen name="goals" options={{ title: "Metas" }} />
                    <Drawer.Screen name="settings" options={{ title: "Configurações" }} />
                </Drawer>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },

    rightWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
    onlinePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    onlineTxt: { color: COLORS.active, fontSize: 12, fontWeight: "600" },

    drawerScroll: { flex: 1, paddingVertical: 8, justifyContent: "space-between" },
    section: { paddingVertical: 8 },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginHorizontal: 8,
        borderRadius: 8,
    },
    itemActive: {
        backgroundColor: COLORS.activeBg,
    },
    itemLabel: { fontSize: 16, color: COLORS.text },
    itemLabelActive: { color: COLORS.active, fontWeight: "700" },
    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.divider,
        paddingTop: 8,
    },
});
