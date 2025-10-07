import { loginUser, registerUser } from "@/src/modules/auth/application/usecases/auth";
import { Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
    isLogin: boolean;
    setIsLogin: (v: boolean) => void;
};

export function LoginForm({ isLogin, setIsLogin }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit() {
        setError("");
        try {
            if (!email || !password || (!isLogin && !name)) {
                throw new Error("Por favor, preencha todos os campos.");
            }
            setLoading(true);
            if (isLogin) {
                await loginUser(email, password);
            } else {
                await registerUser(name, email, password);
            }
        } catch (err: any) {
            setError(mapAuthError(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={s.form}>
                {!isLogin && (
                    <View style={s.group}>
                        <Text style={s.label}>Nome Completo</Text>
                        <View style={[s.inputWrap, s.noIcon]}>
                            <TextInput
                                style={s.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Seu nome completo"
                                autoCapitalize="words"
                            />
                        </View>
                    </View>
                )}

                <View style={s.group}>
                    <Text style={s.label}>Email</Text>
                    <View style={s.inputWrap}>
                        <Mail size={18} color="#9CA3AF" style={s.icon} />
                        <TextInput
                            style={[s.input, { paddingLeft: 36 }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="seu@email.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                </View>

                <View style={s.group}>
                    <Text style={s.label}>Senha</Text>
                    <View style={s.inputWrap}>
                        <Lock size={18} color="#9CA3AF" style={s.icon} />
                        <TextInput
                            style={[s.input, { paddingLeft: 36 }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Sua senha"
                            secureTextEntry
                        />
                    </View>
                </View>

                {!!error && <Text style={s.error}>{error}</Text>}

                <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={onSubmit} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={s.btnTxt}>{isLogin ? "Entrar" : "Cadastrar"}</Text>
                    )}
                </TouchableOpacity>

                <View style={s.sep}>
                    <View style={s.sepLine} />
                    <Text style={s.sepTxt}>ou</Text>
                    <View style={s.sepLine} />
                </View>

                {/* botão Google futuro */}

                <TouchableOpacity onPress={() => !loading && setIsLogin(!isLogin)}>
                    <Text style={s.toggle}>{isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

function mapAuthError(err: any): string {
    const code = err?.code || "";
    if (code.includes("auth/email-already-in-use")) return "Este email já está em uso.";
    if (code.includes("auth/invalid-email")) return "Email inválido.";
    if (code.includes("auth/weak-password")) return "Senha fraca. Use 6+ caracteres.";
    if (code.includes("auth/wrong-password")) return "Senha incorreta.";
    if (code.includes("auth/user-not-found")) return "Usuário não encontrado.";
    if (code.includes("auth/too-many-requests")) return "Muitas tentativas. Tente mais tarde.";
    return err?.message || "Ocorreu um erro. Tente novamente.";
}

const s = StyleSheet.create({
    form: { width: "100%" },
    group: { marginBottom: 12 },
    label: { color: "#374151", marginBottom: 4, fontSize: 14, fontWeight: "600" },
    inputWrap: {
        position: "relative",
        borderWidth: 1,
        borderColor: "#BBF7D0",
        borderRadius: 6,
    },
    noIcon: {},
    icon: { position: "absolute", top: 12, left: 10, zIndex: 1 },
    input: {
        height: 44,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    error: { color: "#DC2626", marginTop: 4, marginBottom: 8 },
    btn: {
        height: 46,
        backgroundColor: "#16A34A",
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    btnDisabled: { opacity: 0.7 },
    btnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
    sep: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
    sepLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    sepTxt: { marginHorizontal: 8, color: "#6B7280", fontSize: 13 },
    toggle: { color: "#16A34A", textDecorationLine: "underline", textAlign: "center", marginTop: 8, fontWeight: "600" },
});
