import { Href, router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

export type HomeCard = {
    id: string;
    href: Href;
    icon: React.ReactNode;
    title: string;
    description: string;
    tint?: string;
};

export function DashCards({ cards }: { cards: HomeCard[] }) {
    return (
        <View style={styles.list}>
            {cards.map((card) => (
                <Pressable
                    key={card.id}
                    onPress={() => router.push(card.href)}
                    android_ripple={{ color: "#E3F6EA" }}
                    style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                    accessibilityRole="button"
                    accessibilityLabel={card.title}
                    accessibilityHint={`Abrir ${card.title}`}
                >
                    <View style={[styles.iconWrap, { backgroundColor: card.tint ?? "#EAF7F0" }]}>{card.icon}</View>

                    <View style={styles.textCol}>
                        <Text style={styles.title}>{card.title}</Text>
                        <Text style={styles.desc}>{card.description}</Text>
                    </View>

                    <ChevronRight size={18} color="#9CA3AF" />
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: 12,
        paddingHorizontal: 16,
    },
    item: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        ...(Platform.OS === "android" ? { elevation: 1 } : null),
    },
    itemPressed: {
        backgroundColor: "#F6FFF9",
        borderColor: "#CFEFDC",
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    textCol: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0B1220",
        letterSpacing: 0.2,
    },
    desc: {
        fontSize: 14,
        color: "#6B7280",
    },
});
