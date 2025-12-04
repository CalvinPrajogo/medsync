import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES } from "../constants/theme";

const TERMS_ACCEPTED_KEY = "@medsync:terms_accepted";

const TermsAndConditionsScreen = ({ navigation }) => {
    const [accepted, setAccepted] = useState(false);

    const handleAccept = async () => {
        if (!accepted) {
            Alert.alert(
                "Acceptance Required",
                "Please read and accept the Terms and Conditions to continue."
            );
            return;
        }

        try {
            await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, "true");
            navigation.replace("Home");
        } catch (error) {
            console.error("Error saving terms acceptance:", error);
            Alert.alert("Error", "Failed to save acceptance. Please try again.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Terms and Conditions</Text>
            </View>

            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                        name="file-document-outline"
                        size={64}
                        color={COLORS.primary}
                    />
                </View>

                <Text style={styles.title}>Welcome to MedSync</Text>
                <Text style={styles.subtitle}>
                    Please read and accept our Terms and Conditions to continue
                </Text>

                <View style={styles.termsSection}>
                    <Text style={styles.sectionTitle}>1. Medical Disclaimer</Text>
                    <Text style={styles.paragraph}>
                        MedSync is <Text style={styles.bold}>NOT a medical application</Text> informed, 
                        reviewed, or endorsed by medical doctors or healthcare professionals. This 
                        application is provided solely for personal convenience and tracking purposes.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Not a Substitute for Medical Advice</Text>
                    <Text style={styles.paragraph}>
                        The information, features, and services provided by MedSync are <Text style={styles.bold}>
                        NOT intended to replace professional medical advice, diagnosis, or treatment</Text>. 
                        Always seek the advice of your physician or other qualified health provider with 
                        any questions you may have regarding a medical condition.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Consultation Required</Text>
                    <Text style={styles.paragraph}>
                        For any medical-related decisions, concerns, or questions, you must <Text style={styles.bold}>
                        consult with qualified healthcare professionals, including licensed doctors, 
                        pharmacists, or other medical practitioners</Text>. Do not rely solely on this 
                        application for medical decisions.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Tracking Application Only</Text>
                    <Text style={styles.paragraph}>
                        MedSync is a medication and health tracking application designed to help you 
                        organize and monitor your medication schedule, track interactions, and manage 
                        health-related information. It is a tool for personal record-keeping and 
                        convenience only.
                    </Text>

                    <Text style={styles.sectionTitle}>5. No Medical Responsibility</Text>
                    <Text style={styles.paragraph}>
                        MedSync, its developers, and affiliates <Text style={styles.bold}>are NOT 
                        responsible for any medical decisions, health outcomes, medication errors, 
                        drug interactions, or any consequences</Text> arising from the use or misuse 
                        of this application. You assume full responsibility for your health decisions.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Accuracy of Information</Text>
                    <Text style={styles.paragraph}>
                        While we strive to provide accurate information, MedSync does not guarantee 
                        the accuracy, completeness, or timeliness of any information provided. Drug 
                        interaction data and medical information should be verified with healthcare 
                        professionals.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Emergency Situations</Text>
                    <Text style={styles.paragraph}>
                        In case of a medical emergency, <Text style={styles.bold}>immediately contact 
                        emergency services (911 or your local emergency number)</Text>. Do not use this 
                        application as a means to seek emergency medical assistance.
                    </Text>

                    <Text style={styles.sectionTitle}>8. User Responsibility</Text>
                    <Text style={styles.paragraph}>
                        You are solely responsible for:
                        {'\n'}• Verifying all medication information with healthcare providers
                        {'\n'}• Consulting doctors before making any medical decisions
                        {'\n'}• Ensuring the accuracy of information you enter
                        {'\n'}• Using the application in accordance with medical advice
                    </Text>

                    <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
                    <Text style={styles.paragraph}>
                        To the fullest extent permitted by law, MedSync and its developers shall not 
                        be liable for any direct, indirect, incidental, special, or consequential 
                        damages resulting from the use or inability to use this application.
                    </Text>

                    <Text style={styles.sectionTitle}>10. Acceptance</Text>
                    <Text style={styles.paragraph}>
                        By accepting these Terms and Conditions, you acknowledge that you have read, 
                        understood, and agree to be bound by all terms stated above. You understand 
                        that MedSync is a tracking tool only and not a substitute for professional 
                        medical care.
                    </Text>
                </View>

                {/* Acceptance Checkbox */}
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAccepted(!accepted)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                        {accepted && (
                            <MaterialCommunityIcons
                                name="check"
                                size={20}
                                color="#FFFFFF"
                            />
                        )}
                    </View>
                    <Text style={styles.checkboxLabel}>
                        I have read and agree to the Terms and Conditions
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Accept Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.acceptButton,
                        !accepted && styles.acceptButtonDisabled,
                    ]}
                    onPress={handleAccept}
                    disabled={!accepted}
                >
                    <Text style={styles.acceptButtonText}>Accept and Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SIZES.padding,
        paddingBottom: 100,
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 20,
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#000000",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666666",
        textAlign: "center",
        marginBottom: 32,
    },
    termsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.primary,
        marginTop: 20,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        color: "#333333",
        lineHeight: 22,
        marginBottom: 12,
    },
    bold: {
        fontWeight: "bold",
        color: "#000000",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 16,
        padding: 12,
        backgroundColor: "#F5F5F7",
        borderRadius: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        color: "#000000",
        fontWeight: "500",
    },
    buttonContainer: {
        padding: SIZES.padding,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
    },
    acceptButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    acceptButtonDisabled: {
        backgroundColor: "#CCCCCC",
    },
    acceptButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default TermsAndConditionsScreen;

