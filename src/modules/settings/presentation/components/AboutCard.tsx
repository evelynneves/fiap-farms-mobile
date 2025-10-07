import { Info, Sprout } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const AboutCard: React.FC = () => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>
                <Info size={18} color="#16a34a" /> Sobre
            </Text>

            <View style={styles.content}>
                <View style={styles.row}>
                    <Sprout size={16} color="#16a34a" />
                    <Text style={styles.bold}> FIAP Farms</Text>
                </View>

                <Text style={styles.p}>
                    <Text style={styles.bold}>Versão:</Text> 1.0.0
                </Text>
                <Text style={styles.p}>
                    <Text style={styles.bold}>Última atualização:</Text> Outubro 2025
                </Text>

                <View style={styles.divider} />

                <Text style={[styles.bold, { marginBottom: 4 }]}>Cooperativa Agrícola FIAP Farms</Text>
                <Text style={styles.p}>
                    Plataforma de gestão para produtores rurais com foco em vendas, produção e metas estratégicas.
                </Text>

                <Text style={styles.small}>© 2025 FIAP Farms. Todos os direitos reservados</Text>
            </View>
        </View>
    );
};

export default AboutCard;

const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 16 },
    title: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
    content: { gap: 8 },
    row: { flexDirection: "row", alignItems: "center" },
    bold: { fontWeight: "700", color: "#111827" },
    p: { color: "#374151", fontSize: 14 },
    small: { color: "#6B7280", fontSize: 12, marginTop: 6 },
    divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
});
