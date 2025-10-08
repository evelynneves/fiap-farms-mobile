import { Bell } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    deleteNotification,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../../infrastructure/services/notificationsService";
import {
    getUserNotifications,
    setUserNotifications,
    type UserNotification,
} from "../../infrastructure/services/userNotificationsService";

export default function NotificationsButton() {
    const [open, setOpen] = useState(false);
    const [list, setList] = useState<UserNotification[]>([]);

    useEffect(() => {
        (async () => {
            const data = (await getUserNotifications()) as UserNotification[];
            setList(data);
        })();
    }, []);

    const unread = list.filter((n) => !n.read).length;

    async function onMarkAll() {
        const updated: UserNotification[] = list.map((n) => ({ ...n, read: true }));
        await markAllNotificationsAsRead(list.map((n) => n.id));
        setList(updated);
        await setUserNotifications(updated);
    }

    async function onMarkOne(id: string) {
        const updated: UserNotification[] = list.map((n) => (n.id === id ? { ...n, read: true } : n));
        await markNotificationAsRead(id);
        setList(updated);
        await setUserNotifications(updated);
    }

    async function onDelete(id: string) {
        const updated: UserNotification[] = list.filter((n) => n.id !== id);
        await deleteNotification(id);
        setList(updated);
        await setUserNotifications(updated);
    }

    const typeStyles: Record<UserNotification["type"], any> = {
        success: styles.successItem,
        warning: styles.warningItem,
        info: styles.infoItem,
    };

    const fmtDate = (ts: string | undefined) => (ts ? new Date(ts).toLocaleString("pt-BR") : "");

    return (
        <View style={{ position: "relative" }}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setOpen(true)}>
                <Bell size={20} color="#374151" />
                {unread > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeTxt}>{unread}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <View style={styles.overlay}>
                    <View style={styles.dropdown}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Notificações</Text>
                            <TouchableOpacity onPress={onMarkAll}>
                                <Text style={styles.markAll}>Marcar todas como lidas</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={list}
                            keyExtractor={(it) => it.id}
                            style={{ maxHeight: 360 }}
                            ListEmptyComponent={<Text style={styles.empty}>Sem notificações</Text>}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => onMarkOne(item.id)}
                                    style={[styles.item, item.read ? styles.itemRead : typeStyles[item.type]]}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        <Text style={styles.itemMsg}>{item.message}</Text>
                                        {!!item.timestamp && (
                                            <Text style={styles.itemTime}>{fmtDate(item.timestamp)}</Text>
                                        )}
                                    </View>

                                    <TouchableOpacity onPress={() => onDelete(item.id)}>
                                        <Text style={styles.dismiss}>×</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                            <Text style={styles.closeTxt}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    iconBtn: { padding: 10 },
    badge: {
        position: "absolute",
        top: 2,
        right: 2,
        backgroundColor: "#DC2626",
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    badgeTxt: { color: "#FFF", fontSize: 10, fontWeight: "700" },

    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "flex-start", alignItems: "flex-end" },
    dropdown: {
        marginTop: 60,
        marginRight: 12,
        width: 340,
        backgroundColor: "#FFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    markAll: { color: "#059669", fontSize: 12, fontWeight: "700" },
    empty: { textAlign: "center", color: "#6B7280", padding: 16 },

    item: {
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    itemRead: { opacity: 0.6, borderLeftWidth: 4, borderLeftColor: "#E5E7EB" },
    successItem: { backgroundColor: "#ECFDF5", borderLeftWidth: 4, borderLeftColor: "#10B981" },
    warningItem: { backgroundColor: "#FFFBEB", borderLeftWidth: 4, borderLeftColor: "#F59E0B" },
    infoItem: { backgroundColor: "#EFF6FF", borderLeftWidth: 4, borderLeftColor: "#3B82F6" },
    itemTitle: { fontWeight: "700", fontSize: 14, color: "#111827" },
    itemMsg: { fontSize: 12, color: "#4B5563", marginTop: 2 },
    itemTime: { fontSize: 11, color: "#6B7280", marginTop: 4 },
    dismiss: { color: "#9CA3AF", fontSize: 20, paddingHorizontal: 6 },
    closeBtn: { alignItems: "center", paddingVertical: 10 },
    closeTxt: { color: "#111827", fontWeight: "700" },
});
