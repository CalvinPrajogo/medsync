import React from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/theme";

const LoginScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <Text style={styles.title}>Login here</Text>
                    <Text style={styles.subtitle}>
                        Welcome back you've{"\n"}been missed!
                    </Text>

                    {/* Email Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Password Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                    />

                    {/* Forgot Password */}
                    <TouchableOpacity>
                        <Text style={styles.forgotPassword}>
                            Forgot your password?
                        </Text>
                    </TouchableOpacity>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={() => navigation.navigate("Home")}
                    >
                        <Text style={styles.signInButtonText}>Sign in</Text>
                    </TouchableOpacity>

                    {/* Create Account */}
                    <TouchableOpacity>
                        <Text style={styles.createAccount}>
                            Create new account
                        </Text>
                    </TouchableOpacity>

                    {/* Or Continue With */}
                    <Text style={styles.orText}>Or continue with</Text>

                    {/* Social Login Buttons */}
                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.socialIcon}>G</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.socialIcon}>f</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.socialIcon}>🍎</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: COLORS.primary,
        textAlign: "center",
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 28,
    },
    input: {
        backgroundColor: "#F1F4FF",
        borderRadius: 10,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    forgotPassword: {
        color: COLORS.primary,
        textAlign: "right",
        fontSize: 14,
        marginBottom: 24,
    },
    signInButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: 18,
        alignItems: "center",
        marginBottom: 24,
    },
    signInButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "600",
    },
    createAccount: {
        color: "#000",
        textAlign: "center",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 32,
    },
    orText: {
        color: COLORS.primary,
        textAlign: "center",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 16,
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
    },
    socialButton: {
        backgroundColor: "#F1F4FF",
        width: 60,
        height: 60,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    socialIcon: {
        fontSize: 24,
        fontWeight: "bold",
    },
});

export default LoginScreen;
