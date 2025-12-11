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
import NotificationScheduler from "../services/NotificationScheduler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rrulestr } from "rrule";
import { DateTime } from "luxon";
import { useSchedule } from "../context/ScheduleContext";
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
    const [pendingSchedule, setPendingSchedule] = useState(null); 
    const { addToSchedule } = useSchedule();

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
            //include recent chat history
            const convo = [...messages, { role: 'user', content: userMessage }];
            const recent = convo.slice(-10);
            const convoText = recent
                .map((m) => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`))
                .join('\n');

            // Create a medical-focused instruction that instructs the model to output structured JSON 
            const systemInstruction = `You are a concise medical assistant. When the user asks to create a reminder/schedule, you MUST either:\n\n1) Ask a short clarifying question in plain text if any required scheduling fields are missing or ambiguous (do NOT output JSON), OR\n2) Output ONLY a single JSON object (no surrounding explanation) that exactly matches this schema when you can create the schedule.\n\nImportant: The \"title\" field MUST contain ONLY the medication name (for example: \"Lisinopril\" or \"Ibuprofen\") — do NOT include dosage, instructions, frequency, times, or other details in the \"title\". Put dosage or instruction text in the \"body\" field instead.\n\nRequired JSON schema (exact keys):\n{\n  "schedule_id": string | null,          // optional id (or null)\n  "dtstart": "YYYY-MM-DDTHH:MM:SSZ",     // ISO 8601 UTC or with timezone offset\n  "timezone": "America/Los_Angeles",     // IANA timezone name\n  "rrule": "RRULE:FREQ=...;...",         // RFC5545 rrule string\n  "title": "string",\n  "body": "string",\n  "occurrences": integer,\n  "confidence": number,                  // 0.0 - 1.0 confidence score\n  "ambiguous_fields": ["fieldName"]      // empty array if none\n}\n\nIf you produce JSON, output only the JSON object (no markdown, no comments). Example valid output:\n\n{"schedule_id": null, "dtstart":"2025-11-20T08:00:00-08:00","timezone":"America/Los_Angeles","rrule":"RRULE:FREQ=DAILY;INTERVAL=1","title":"Take Lisinopril 10mg","body":"Take one tablet","occurrences":10,"confidence":0.92,"ambiguous_fields":[]}\n\nIf the user asks general medical questions, answer concisely as normal. Keep responses short and helpful.`;

            // Provide current date/time 
            const now = DateTime.now();
            const nowIso = now.toISO();
            const nowZone = now.zoneName || "UTC";
            const prompt = `${systemInstruction}\n\nNote: Current date/time is ${nowIso} (${nowZone}). When the user uses relative terms like \"today\", \"tomorrow\", or weekday names, interpret them relative to this timestamp.\n\nConversation:\n${convoText}\n\nUser question: ${userMessage}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            //Debugging - console.debug('[Chatbot] assistant raw text:', text);

            // Try to extract schedule JSON from the assistant text
            const schedule = tryExtractScheduleJSON(text);
            if (schedule) {
                // Validate schedule fields before presenting confirmation UI
                const validation = validateSchedule(schedule);
                if (!validation.valid) {
                    // send a error back to user 
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: `I found a scheduling request but some fields are invalid: ${validation.error}. Please clarify.`,
                        },
                    ]);
                } else {
                    // Send a confirmation to the user 
                    setPendingSchedule(schedule);
                    setMessages((prev) => [
                        ...prev,
                        { role: "assistant", content: "I can create this schedule for you. Please confirm." },
                    ]);
                }
            } else {
                // Add assistant response to chat 
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: text },
                ]);
            }
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

    // Helper: attempt to extract JSON object from assistant text
    const tryExtractScheduleJSON = (text) => {
        if (!text) return null;
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start === -1 || end === -1 || end <= start) return null;
        const jsonStr = text.substring(start, end + 1);
        try {
            const obj = JSON.parse(jsonStr);
            // Check required schema keys
            const required = ["schedule_id", "dtstart", "timezone", "rrule", "title", "body", "occurrences", "confidence", "ambiguous_fields"];
            const hasAll = required.every((k) => Object.prototype.hasOwnProperty.call(obj, k));
            if (hasAll) return obj;
        } catch (e) {
            return null;
        }
        return null;
    };

    // Helper: validate dtstart/timezone/rrule using luxon + rrule
    const validateSchedule = (sched) => {
        try {
            const dt = DateTime.fromISO(sched.dtstart, { zone: sched.timezone });
            if (!dt.isValid) return { valid: false, error: "Invalid dtstart or timezone" };
            try {
                rrulestr(sched.rrule);
            } catch (e) {
                return { valid: false, error: "Invalid rrule" };
            }
            return { valid: true };
        } catch (e) {
            return { valid: false, error: "Unknown validation error" };
        }
    };

    const generateLocalId = () => `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Extract dose times (HH:mm) from an RRULE's BYHOUR/BYMINUTE or fall back to dtstart time
    const extractDoseTimes = (sched) => {
        if (!sched) return [];
        // Try to read BYHOUR/BYMINUTE from the parsed rrule options
        try {
            if (sched.rrule) {
                const rule = rrulestr(sched.rrule);
                const opts = rule.origOptions || rule.options || {};

                const byhour = opts.byhour ?? opts.by_hour ?? opts.byHour ?? opts.hour ?? [];
                const byminute = opts.byminute ?? opts.by_minute ?? opts.byMinute ?? opts.minute ?? [];

                const hours = Array.isArray(byhour) ? byhour : (byhour !== undefined && byhour !== null ? [byhour] : []);
                const minutes = Array.isArray(byminute) ? byminute : (byminute !== undefined && byminute !== null ? [byminute] : []);

                const times = [];
                if (hours.length > 0) {
                    const mins = minutes.length > 0 ? minutes : [0];
                    for (const h of hours) {
                        for (const m of mins) {
                            const hh = String(Number(h)).padStart(2, "0");
                            const mm = String(Number(m)).padStart(2, "0");
                            times.push(`${hh}:${mm}`);
                        }
                    }
                }

                if (times.length > 0) {
                    // dedupe and sort by time of day
                    return Array.from(new Set(times)).sort((a, b) => {
                        const [ah, am] = a.split(":").map(Number);
                        const [bh, bm] = b.split(":").map(Number);
                        return ah * 60 + am - (bh * 60 + bm);
                    });
                }
            }
        } catch (e) {
        }

        // Fallback: use dtstart's local time 
        try {
            if (sched.dtstart) {
                const dt = DateTime.fromISO(sched.dtstart, { zone: sched.timezone });
                if (dt.isValid) return [dt.toFormat("HH:mm")];
            }
        } catch (e) {
        }

        return [];
    };

    // Confirm schedule: call scheduler, persist ids, and post confirmation message
    const confirmPendingSchedule = async () => {
        if (!pendingSchedule) return;
        const scheduleId = pendingSchedule.schedule_id || generateLocalId();

        // Normalize dtstart with timezone 
        const dt = DateTime.fromISO(pendingSchedule.dtstart, { zone: pendingSchedule.timezone });
        if (!dt.isValid) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Invalid start date/time: ${pendingSchedule.dtstart}. Please clarify.` },
            ]);
            setPendingSchedule(null);
            return;
        }

        // Use an ISO string for scheduler
        const dtIso = dt.toISO();

        try {
            const ids = await NotificationScheduler.scheduleRecurringNotifications({
                scheduleId,
                title: pendingSchedule.title,
                body: pendingSchedule.body,
                dtstartIso: dtIso,
                timezone: pendingSchedule.timezone,
                rruleString: pendingSchedule.rrule,
                occurrences: pendingSchedule.occurrences || 10,
            });

            // persist scheduled ids 
            const storageKey = `@sched:notifications:${scheduleId}`;
            await AsyncStorage.setItem(storageKey, JSON.stringify(ids));

            // Add confirmation message to chat
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Confirmed",
                    schedule_id: scheduleId,
                },
            ]);

            // ScheduleScreen Card
            try {
                const freqMatch = (pendingSchedule.rrule || "").match(/FREQ=([^;]+)/i);
                const frequency = freqMatch ? freqMatch[1].toLowerCase() : "custom";
                const medicine = {
                    id: scheduleId,
                    name: pendingSchedule.title || "Scheduled Reminder",
                    dosage: pendingSchedule.body || "",
                };
                const timing = {
                    frequency,
                    rrule: pendingSchedule.rrule,
                    nextDoseDate: dt.toISO(),
                    timezone: pendingSchedule.timezone,
                    doseTimes: extractDoseTimes(pendingSchedule),
                    occurrences: pendingSchedule.occurrences || 10,
                };
                addToSchedule(medicine, timing);
            } catch (e) {
                console.warn('Failed to add scheduled medicine to context', e);
            }
        } catch (e) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Failed to schedule: ${e.message || e}` },
            ]);
        } finally {
            setPendingSchedule(null);
        }
    };

    const cancelScheduled = async (scheduleId) => {
        try {
            await NotificationScheduler.cancelScheduledNotifications(scheduleId);
            const storageKey = `@sched:notifications:${scheduleId}`;
            await AsyncStorage.removeItem(storageKey);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Schedule ${scheduleId} cancelled.` },
            ]);
        } catch (e) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Failed to cancel schedule: ${e.message || e}` },
            ]);
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
                        <View key={index}>
                            <View
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
                        </View>
                    ))}
                    {loading && (
                        <View style={[styles.messageBubble, styles.assistantMessage]}>
                            <Text style={styles.messageText}>Thinking...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Confirmation UI for a pending schedule returned by the LLM */}
                {pendingSchedule && (
                    <View style={styles.confirmContainer}>
                        <Text style={styles.confirmText}>
                            {(() => {
                                const dt = DateTime.fromISO(pendingSchedule.dtstart, { zone: pendingSchedule.timezone });
                                const start = dt.isValid ? dt.toLocaleString(DateTime.DATETIME_MED) : pendingSchedule.dtstart;
                                const freqMatch = (pendingSchedule.rrule || "").match(/FREQ=([^;]+)/i);
                                const freqLabel = freqMatch ? freqMatch[1].charAt(0).toUpperCase() + freqMatch[1].slice(1).toLowerCase() : pendingSchedule.rrule;
                                return `Create schedule for ${pendingSchedule.title} — starts ${start} (${pendingSchedule.timezone}) · Frequency: ${freqLabel}`;
                            })()}
                        </Text>
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.confirmCancel]}
                                onPress={() => {
                                    // cancel pending schedule flow
                                    setMessages((prev) => [
                                        ...prev,
                                        { role: "assistant", content: "Scheduling cancelled." },
                                    ]);
                                    setPendingSchedule(null);
                                }}
                            >
                                <Text style={styles.confirmBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.confirmOk]}
                                onPress={confirmPendingSchedule}
                            >
                                <Text style={styles.confirmBtnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

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
    confirmContainer: {
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    confirmText: {
        fontSize: 14,
        marginBottom: 8,
        color: '#333'
    },
    confirmButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    confirmBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    confirmCancel: {
        backgroundColor: '#F44336',
    },
    confirmOk: {
        backgroundColor: '#2196F3',
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    scheduleActions: {
        marginTop: 6,
        marginLeft: SIZES.padding,
    },
    scheduleActionButton: {
        backgroundColor: '#FFF',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    scheduleActionText: {
        color: '#333',
    }
});

export default ChatbotScreen;

