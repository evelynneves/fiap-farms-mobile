import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = { message: string; type?: "error" | "warning" | "success" };

export const AlertMessage: React.FC<Props> = ({ message, type = "error" }) => {
    const tone = type === "success" ? styles.success : type === "warning" ? styles.warning : styles.error;

    const txtTone = type === "success" ? styles.successTxt : type === "warning" ? styles.warningTxt : styles.errorTxt;

    return (
        <View style={[styles.alert, tone]}>
            <Text style={[styles.alertTxt, txtTone]}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    alert: { padding: 12, borderRadius: 8, borderWidth: 1 },
    alertTxt: { fontSize: 14 },
    error: { backgroundColor: "#FEE2E2", borderColor: "#FECACA" },
    errorTxt: { color: "#B91C1C" },
    warning: { backgroundColor: "#FEF9C3", borderColor: "#FDE68A" },
    warningTxt: { color: "#CA8A04" },
    success: { backgroundColor: "#DCFCE7", borderColor: "#BBF7D0" },
    successTxt: { color: "#15803D" },
});
