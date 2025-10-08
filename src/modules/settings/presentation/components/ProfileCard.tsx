import { Camera, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export interface ProfileData {
    name: string;
    email: string;
    avatar?: string;
}

type Props = {
    profileData: ProfileData;
    onSaveProfile: (data: ProfileData) => Promise<void> | void;
};

const ProfileCard: React.FC<Props> = ({ profileData, onSaveProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localForm, setLocalForm] = useState<ProfileData>(profileData);

    useEffect(() => {
        setLocalForm(profileData);
    }, [profileData]);

    const handleSave = async () => {
        await onSaveProfile(localForm);
        setIsEditing(false);
    };

    const initial = (profileData.name || "?").slice(0, 1).toUpperCase();

    return (
        <View style={styles.card}>
            <Text style={styles.title}>
                <User size={18} color="#16a34a" /> Informações do Usuário
            </Text>
            <Text style={styles.subtitle}>Gerencie suas informações pessoais</Text>

            <View style={styles.infoRow}>
                <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarTxt}>{initial}</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarBtn} onPress={() => alert("Upload de foto em breve!")}>
                        <Camera size={14} color="#111827" />
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.name}>{profileData.name}</Text>
                    <Text style={styles.email}>{profileData.email}</Text>

                    {!isEditing && (
                        <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                            <Text style={styles.editBtnTxt}>Editar Perfil</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isEditing && (
                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Nome Completo</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Maria Silva"
                            value={localForm.name}
                            onChangeText={(t) => setLocalForm((p) => ({ ...p, name: t }))}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={localForm.email}
                            onChangeText={(t) => setLocalForm((p) => ({ ...p, email: t }))}
                        />
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.primary} onPress={handleSave}>
                            <Text style={styles.primaryTxt}>Salvar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondary}
                            onPress={() => {
                                setIsEditing(false);
                                setLocalForm(profileData);
                            }}
                        >
                            <Text style={styles.secondaryTxt}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

export default ProfileCard;

const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 16 },
    title: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 6 },
    subtitle: { color: "#6b7280", marginBottom: 16 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatarWrap: { position: "relative" },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#D1FAE5",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarTxt: { color: "#059669", fontWeight: "800", fontSize: 20 },
    avatarBtn: {
        position: "absolute",
        right: -6,
        bottom: -6,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    name: { fontSize: 18, fontWeight: "700", color: "#111827" },
    email: { color: "#6B7280" },
    editBtn: {
        marginTop: 6,
        alignSelf: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#fff",
    },
    editBtnTxt: { fontSize: 12, fontWeight: "700", color: "#000" },

    form: { marginTop: 14, gap: 10 },
    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: "700", color: "#000" },
    input: {
        height: 42,
        borderWidth: 1,
        borderColor: "#BBF7D0",
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },

    actions: { flexDirection: "row", gap: 8, marginTop: 4 },
    primary: { flex: 1, backgroundColor: "#10B981", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
    primaryTxt: { color: "#fff", fontWeight: "700" },
    secondary: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    secondaryTxt: { color: "#111827", fontWeight: "700" },
});
