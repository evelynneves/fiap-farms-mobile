import { Bell, Lock, Shield, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import {
    getNotifications,
    setNotifications,
    type NotificationsConfig,
} from "../../infrastructure/services/notificationsService";

const AccountCard: React.FC = () => {
    const [notifications, setLocalNotifications] = useState<NotificationsConfig>({
        stock: true,
        goals: true,
        production: true,
    });

    useEffect(() => {
        (async () => {
            const cfg = await getNotifications();
            setLocalNotifications(cfg);
        })();
    }, []);

    const toggle = async (key: keyof NotificationsConfig) => {
        const updated = { ...notifications, [key]: !notifications[key] };
        setLocalNotifications(updated);
        await setNotifications(updated);
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>
                <Shield size={18} color="#16a34a" /> Gerenciamento de Conta
            </Text>
            <Text style={styles.subtitle}>Configurações de segurança e conta</Text>

            {/* Reset password */}
            <View style={styles.section}>
                <View style={styles.leftRow}>
                    <Lock size={20} color="#6b7280" />
                    <View>
                        <Text style={styles.h3}>Redefinir Senha</Text>
                        <Text style={styles.muted}>Altere sua senha de acesso</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.btnOutline} onPress={() => alert("Redefinir senha em breve!")}>
                    <Text style={styles.btnOutlineTxt}>Redefinir</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.hr} />

            {/* Notification toggles */}
            <View style={{ gap: 8 }}>
                <Text style={styles.h3Row}>
                    <Bell size={18} color="#16a34a" /> Configurações de Notificações
                </Text>

                {[
                    {
                        key: "stock" as const,
                        title: "Notificações de Estoque",
                        desc: "Alertas quando estoque estiver baixo",
                    },
                    {
                        key: "goals" as const,
                        title: "Notificações de Metas",
                        desc: "Alertas quando metas forem atingidas",
                    },
                    // você pode habilitar "production" aqui se quiser expor no UI
                ].map(({ key, title, desc }) => (
                    <View key={key} style={styles.toggleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.toggleTitle}>{title}</Text>
                            <Text style={styles.muted}>{desc}</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#D1D5DB", true: "#10b981" }}
                            thumbColor="#fff"
                            value={!!notifications[key]}
                            onValueChange={() => toggle(key)}
                        />
                    </View>
                ))}
            </View>

            <View style={styles.hr} />

            {/* Delete account */}
            <View style={styles.deleteRow}>
                <View style={styles.leftRow}>
                    <Trash2 size={20} color="#dc2626" />
                    <View>
                        <Text style={[styles.h3, { color: "#b91c1c" }]}>Excluir Conta</Text>
                        <Text style={[styles.muted, { color: "#dc2626" }]}>Esta ação não pode ser desfeita</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.btnDanger} onPress={() => alert("Excluir conta em breve!")}>
                    <Text style={styles.btnDangerTxt}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AccountCard;

const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 16 },
    title: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 6 },
    subtitle: { color: "#6b7280", marginBottom: 16 },
    section: {
        backgroundColor: "#f9fafb",
        padding: 12,
        borderRadius: 8,
        borderWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    leftRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    h3: { fontSize: 15, fontWeight: "700", color: "#111827" },
    h3Row: { fontSize: 15, fontWeight: "700", color: "#111827", flexDirection: "row" } as any,
    muted: { color: "#6b7280", fontSize: 13 },
    btnOutline: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d1d5db",
        backgroundColor: "#fff",
    },
    btnOutlineTxt: { color: "#000", fontWeight: "700" },
    hr: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 14 },
    toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
    toggleTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
    deleteRow: {
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: 8,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    btnDanger: { backgroundColor: "#dc2626", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    btnDangerTxt: { color: "#fff", fontWeight: "700" },
});
