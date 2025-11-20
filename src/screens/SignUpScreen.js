import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/theme";
import { useAuth } from '../context/AuthContext';

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const handleSignUp = async () => {
        // Basic validation
        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        const result = await signup(email, password);
        setLoading(false);

        if (result.success) {
            Alert.alert(
                "Success", 
                "Account created successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("Home")
                    }
                ]
            );
        } else {
            Alert.alert("Error", result.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Create an account so you can{"\n"}manage your medications
                    </Text>

                    {/* Email Input */}
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Password Input */}
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                    />

                    {/* Confirm Password Input */}
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                    />

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={styles.signUpButton}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.signUpButtonText}>Sign up</Text>
                        )}
                    </TouchableOpacity>

                    {/* Already Have Account */}
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLink}>Login</Text>
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
        fontSize: 18,
        fontWeight: "500",
        color: "#000",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 26,
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
    signUpButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: 18,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 24,
    },
    signUpButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "600",
    },
    loginText: {
        color: "#000",
        textAlign: "center",
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 32,
    },
    loginLink: {
        color: COLORS.primary,
        fontWeight: "600",
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

export default SignUpScreen;
