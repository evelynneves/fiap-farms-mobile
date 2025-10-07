import { useAuth } from "@/src/modules/shared/contexts/useAuthContext";
import { LogOut } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const LogoutCard: React.FC = () => {
    const { logout, loading } = useAuth();

    const onLogout = async () => {
        await logout();
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={onLogout} disabled={loading}>
                <LogOut size={18} color="#fff" />
                <Text style={styles.btnTxt}>{loading ? "Saindo..." : "Sair da Conta"}</Text>
            </TouchableOpacity>
            <Text style={styles.note}>Você será redirecionado para a tela de login</Text>
        </View>
    );
};

export default LogoutCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
    },
    btn: {
        backgroundColor: "#dc2626",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    btnDisabled: { opacity: 0.7 },
    btnTxt: { color: "#fff", fontWeight: "700" },
    note: { marginTop: 8, color: "#6B7280", fontSize: 12 },
});
