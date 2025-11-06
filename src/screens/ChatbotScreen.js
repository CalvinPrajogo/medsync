import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/gemini";
import { COLORS, SIZES } from "../constants/theme";

const ChatbotScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hello! I'm your medical assistant chatbot. How can I help you today?",
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef(null);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    useEffect(() => {
        // Scroll to bottom when new messages are added
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const sendMessage = async () => {
        if (!inputText.trim() || loading) return;

        if (GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
            alert(
                "Please set your Gemini API key in src/config/gemini.js\n\nGet your free API key from: https://makersuite.google.com/app/apikey"
            );
            return;
        }

        const userMessage = inputText.trim();
        setInputText("");
        setLoading(true);

        // Add user message to chat
        setMessages((prev) => [
            ...prev,
            { role: "user", content: userMessage },
        ]);

        try {
            // Create a medical-focused prompt
            const prompt = `You are a helpful medical assistant chatbot. Provide accurate, helpful information about medications, health questions, and general medical advice. Always remind users to consult with healthcare professionals for serious medical concerns. Keep responses concise and friendly.

User question: ${userMessage}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Add assistant response to chat
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: text },
            ]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            let errorMessage = "Sorry, I encountered an error. Please try again.";
            
            if (error.message?.includes("API key")) {
                errorMessage = "Invalid API key. Please check your API key in src/config/gemini.js";
            } else if (error.message?.includes("404") || error.message?.includes("not found")) {
                errorMessage = "Model not found. Please check your API configuration.";
            } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
                errorMessage = "API quota exceeded. Please try again later.";
            }
            
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: errorMessage,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chat Assistant</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((message, index) => (
                        <View
                            key={index}
                            style={[
                                styles.messageBubble,
                                message.role === "user"
                                    ? styles.userMessage
                                    : styles.assistantMessage,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    message.role === "user"
                                        ? styles.userMessageText
                                        : styles.assistantMessageText,
                                ]}
                            >
                                {message.content}
                            </Text>
                        </View>
                    ))}
                    {loading && (
                        <View style={[styles.messageBubble, styles.assistantMessage]}>
                            <Text style={styles.messageText}>Thinking...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View style={[
                    styles.inputContainer,
                    { paddingBottom: Platform.OS === "ios" ? 8 : 12 }
                ]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        placeholderTextColor="#999"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!inputText.trim() || loading) && styles.sendButtonDisabled,
                        ]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || loading}
                    >
                        <MaterialCommunityIcons
                            name="send"
                            size={24}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "#8B5CF6",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    headerSpacer: {
        width: 40,
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: "#F5F5F7",
    },
    messagesContent: {
        padding: SIZES.padding,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#8B5CF6",
        borderBottomRightRadius: 4,
    },
    assistantMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#FFFFFF",
        borderBottomLeftRadius: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userMessageText: {
        color: "#FFFFFF",
    },
    assistantMessageText: {
        color: "#000000",
    },
    inputContainer: {
        flexDirection: "row",
        paddingHorizontal: SIZES.padding,
        paddingTop: 8,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
        alignItems: "flex-end",
    },
    input: {
        flex: 1,
        backgroundColor: "#F5F5F7",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#8B5CF6",
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#CCCCCC",
    },
});

export default ChatbotScreen;

