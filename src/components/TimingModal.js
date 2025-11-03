import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { COLORS, SIZES } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TimingModal = ({ visible, onClose, onConfirm, medicineName }) => {
    const [morning, setMorning] = useState("1");
    const [afternoon, setAfternoon] = useState("1");
    const [night, setNight] = useState("1");

    const handleConfirm = () => {
        const timing = {
            morning: parseInt(morning) || 0,
            afternoon: parseInt(afternoon) || 0,
            night: parseInt(night) || 0,
        };
        onConfirm(timing);
        // Reset values
        setMorning("1");
        setAfternoon("1");
        setNight("1");
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Set Medication Timing</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialCommunityIcons
                                name="close"
                                size={24}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.medicineName}>{medicineName}</Text>
                    <Text style={styles.instruction}>
                        Enter the number of tablets for each time of day
                    </Text>

                    {/* Morning */}
                    <View style={styles.timingRow}>
                        <View style={styles.timingLabelContainer}>
                            <MaterialCommunityIcons
                                name="weather-sunny"
                                size={20}
                                color="#FFA500"
                            />
                            <Text style={styles.timingLabel}>Morning</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={morning}
                            onChangeText={setMorning}
                            keyboardType="numeric"
                            placeholder="0"
                            maxLength={2}
                        />
                    </View>

                    {/* Afternoon */}
                    <View style={styles.timingRow}>
                        <View style={styles.timingLabelContainer}>
                            <MaterialCommunityIcons
                                name="weather-partly-cloudy"
                                size={20}
                                color="#FF6B6B"
                            />
                            <Text style={styles.timingLabel}>Afternoon</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={afternoon}
                            onChangeText={setAfternoon}
                            keyboardType="numeric"
                            placeholder="0"
                            maxLength={2}
                        />
                    </View>

                    {/* Night */}
                    <View style={styles.timingRow}>
                        <View style={styles.timingLabelContainer}>
                            <MaterialCommunityIcons
                                name="weather-night"
                                size={20}
                                color="#4A90E2"
                            />
                            <Text style={styles.timingLabel}>Night</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={night}
                            onChangeText={setNight}
                            keyboardType="numeric"
                            placeholder="0"
                            maxLength={2}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Add to Schedule</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SIZES.padding,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    closeButton: {
        padding: 4,
    },
    medicineName: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.primary,
        marginBottom: 8,
    },
    instruction: {
        fontSize: 14,
        color: "#666",
        marginBottom: 24,
    },
    timingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#F5F5F7",
        borderRadius: 12,
    },
    timingLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    timingLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        marginLeft: 12,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        width: 80,
        textAlign: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#F5F5F7",
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.white,
    },
});

export default TimingModal;

