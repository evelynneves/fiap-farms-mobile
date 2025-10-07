import {
    Timestamp,
    collection,
    onSnapshot,
    orderBy,
    query,
    type DocumentData,
    type QueryDocumentSnapshot,
} from "firebase/firestore";
import { AlertTriangle, Bell, CheckCircle, Clock, Package, Sprout, Target, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import { db } from "@/src/modules/shared/infrastructure/firebase";
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import {
    deleteNotification,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../../infrastructure/services/notificationsService";

// ==== Tipos ====
type NotificationType = "success" | "warning" | "info";
type NotificationCategory = "stock" | "goals" | "production";

interface NotificationDoc {
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    timestamp?: Timestamp | string | number | Date;
    read: boolean;
}

export interface Notification extends NotificationDoc {
    id: string;
}

export default function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [list, setList] = useState<Notification[]>([]);
    const unread = useMemo(() => list.filter((n) => !n.read).length, [list]);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const ref = collection(db, "users", user.uid, "notifications");
        const q = query(ref, orderBy("timestamp", "desc"));

        const unsub = onSnapshot(q, (snap) => {
            const mapped = snap.docs.map(mapDocToNotification);
            setList(mapped);
        });

        return () => unsub();
    }, []);

    // Ações
    async function onMarkAll() {
        const ids = list.filter((n) => !n.read).map((n) => n.id);
        if (ids.length) await markAllNotificationsAsRead(ids);
    }

    async function onMarkOne(id: string) {
        await markNotificationAsRead(id);
    }

    async function onDelete(id: string) {
        await deleteNotification(id);
    }

    // Helpers de render
    function formatTimestamp(ts?: NotificationDoc["timestamp"]) {
        if (!ts) return "";
        const date =
            ts instanceof Timestamp
                ? ts.toDate()
                : typeof ts === "number" || typeof ts === "string"
                ? new Date(ts)
                : ts;

        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
        // RN atual suporta Intl via Hermes; se preferir, troque por outro formatter
        return date.toLocaleString("pt-BR");
    }

    function renderIcon(type: NotificationType, category: NotificationCategory) {
        if (type === "success") return <CheckCircle size={16} color="#16a34a" />;
        if (type === "warning") return <AlertTriangle size={16} color="#f59e0b" />;

        switch (category) {
            case "stock":
                return <Package size={16} color="#111827" />;
            case "goals":
                return <Target size={16} color="#111827" />;
            case "production":
                return <Sprout size={16} color="#111827" />;
            default:
                return <Clock size={16} color="#111827" />;
        }
    }

    function getItemStyle(n: Notification) {
        if (n.read) return [styles.item, styles.itemRead];
        switch (n.type) {
            case "success":
                return [styles.item, styles.successItem];
            case "warning":
                return [styles.item, styles.warningItem];
            default:
                return [styles.item, styles.infoItem];
        }
    }

    return (
        <View style={{ position: "relative" }}>
            {/* Botão do sino */}
            <TouchableOpacity style={styles.iconBtn} onPress={() => setOpen(true)}>
                <Bell size={20} color="#374151" />
                {unread > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeTxt}>{unread}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Dropdown como Modal */}
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => setOpen(false)} style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.dropdown}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Notificações</Text>
                                {!!unread && (
                                    <TouchableOpacity onPress={onMarkAll}>
                                        <Text style={styles.markAll}>Marcar todas como lidas</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Lista */}
                            <FlatList
                                data={list}
                                keyExtractor={(it) => it.id}
                                style={{ maxHeight: 360 }}
                                ListEmptyComponent={<Text style={styles.empty}>Sem notificações</Text>}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => !item.read && onMarkOne(item.id)}
                                        activeOpacity={0.8}
                                        style={getItemStyle(item)}
                                    >
                                        <View style={styles.itemContent}>
                                            {renderIcon(item.type, item.category)}
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.itemTitle}>{item.title}</Text>
                                                <Text style={styles.itemMsg}>{item.message}</Text>
                                                {!!item.timestamp && (
                                                    <Text style={styles.itemTime}>
                                                        {formatTimestamp(item.timestamp)}
                                                    </Text>
                                                )}
                                            </View>

                                            <TouchableOpacity onPress={() => onDelete(item.id)}>
                                                <X size={16} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />

                            {/* Fechar */}
                            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                                <Text style={styles.closeTxt}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ---------- helpers ----------
function mapDocToNotification(doc: QueryDocumentSnapshot<DocumentData>): Notification {
    const data = doc.data() as NotificationDoc;
    return {
        id: doc.id,
        type: data.type,
        category: data.category,
        title: data.title,
        message: data.message,
        timestamp: data.timestamp,
        read: data.read,
    };
}

// ==== estilos RN (substituem o SCSS) ====
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

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "flex-start",
        alignItems: "flex-end",
    },
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
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
    markAll: { color: "#059669", fontSize: 12, fontWeight: "700" },

    empty: { textAlign: "center", color: "#6B7280", padding: 16 },

    item: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    itemRead: {
        opacity: 0.6,
        borderLeftWidth: 4,
        borderLeftColor: "#E5E7EB",
        backgroundColor: "#FFF",
    },
    successItem: {
        backgroundColor: "#ECFDF5",
        borderLeftWidth: 4,
        borderLeftColor: "#10B981",
    },
    warningItem: {
        backgroundColor: "#FFFBEB",
        borderLeftWidth: 4,
        borderLeftColor: "#F59E0B",
    },
    infoItem: {
        backgroundColor: "#EFF6FF",
        borderLeftWidth: 4,
        borderLeftColor: "#3B82F6",
    },

    itemContent: {
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
    },
    itemTitle: { fontWeight: "700", fontSize: 14, color: "#111827" },
    itemMsg: { fontSize: 12, color: "#4B5563", marginTop: 2 },
    itemTime: { fontSize: 11, color: "#6B7280", marginTop: 4 },

    closeBtn: { alignItems: "center", paddingVertical: 10 },
    closeTxt: { color: "#111827", fontWeight: "700" },
});
