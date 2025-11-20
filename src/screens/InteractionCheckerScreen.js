import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { InteractionCheckerViewModel } from "../viewmodels/InteractionCheckerViewModel";
import { useSchedule } from "../context/ScheduleContext";
import { COLORS, SIZES } from "../constants/theme";

const InteractionCheckerScreen = ({ navigation }) => {
    const { scheduledMedicines } = useSchedule();
    const viewModelRef = useRef(null);
    
    // Initialize ViewModel
    if (!viewModelRef.current) {
        viewModelRef.current = new InteractionCheckerViewModel({ scheduledMedicines });
    }
    const viewModel = viewModelRef.current;

    // Update ViewModel's schedule context reference
    useEffect(() => {
        viewModel.updateScheduleContext({ scheduledMedicines });
    }, [scheduledMedicines]);

    // Local state for UI updates
    const [drugList, setDrugList] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dbInitialized, setDbInitialized] = useState(false);

    useEffect(() => {
        initializeDB();
    }, []);

    const initializeDB = async () => {
        try {
            await viewModel.initializeDatabase();
            setDbInitialized(viewModel.isDbInitialized());
        } catch (error) {
            console.error("Failed to initialize database:", error);
            Alert.alert("Error", error.message || "Failed to initialize database");
        }
    };

    const handleImportFromSchedule = () => {
        try {
            const count = viewModel.importFromSchedule();
            setDrugList(viewModel.getDrugList());
            setResults(null);
            Alert.alert("Imported", `Imported ${count} medicine(s) from your schedule`);
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    const handleCheckInteractions = async () => {
        viewModel.setDrugList(drugList);
        
        try {
            await viewModel.checkInteractions();
            setResults(viewModel.getResults());
            setLoading(viewModel.isLoading());
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to check interactions");
            console.error(error);
        } finally {
            setLoading(viewModel.isLoading());
        }
    };

    const getSeverityColor = (severity) => {
        // Use the model's method if available, otherwise fallback
        if (results?.interactions?.[0]?.getSeverityColor) {
            return results.interactions[0].getSeverityColor();
        }
        // Fallback to direct method
        switch (severity?.toLowerCase()) {
            case "major":
                return "#FF3B30";
            case "moderate":
                return "#FF9500";
            case "minor":
                return "#FFCC00";
            default:
                return "#8E8E93";
        }
    };

    const getSeverityLabel = (severity) => {
        // Use the model's method if available, otherwise fallback
        if (results?.interactions?.[0]?.getSeverityLabel) {
            return results.interactions[0].getSeverityLabel();
        }
        // Fallback to direct method
        switch (severity?.toLowerCase()) {
            case "major":
                return "Major";
            case "moderate":
                return "Moderate";
            case "minor":
                return "Minor";
            default:
                return "Unknown";
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

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
                <Text style={styles.headerTitle}>Drug Interactions</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                    <MaterialCommunityIcons
                        name="information"
                        size={24}
                        color={COLORS.primary}
                        style={styles.infoIcon}
                    />
                    <Text style={styles.instructionsText}>
                        Enter drug names separated by commas to check for potential interactions.
                        Example: ibuprofen, warfarin, aspirin
                    </Text>
                </View>

                {/* Input Area */}
                <View style={styles.inputSection}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Drug Names</Text>
                        {viewModel.getScheduleCount() > 0 && (
                            <TouchableOpacity
                                style={styles.importButton}
                                onPress={handleImportFromSchedule}
                            >
                                <MaterialCommunityIcons
                                    name="download"
                                    size={18}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.importButtonText}>
                                    Import from Schedule ({viewModel.getScheduleCount()})
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={styles.textInput}
                        placeholder="e.g., ibuprofen, warfarin, aspirin"
                        placeholderTextColor="#999"
                        value={drugList}
                        onChangeText={setDrugList}
                        multiline
                        numberOfLines={4}
                    />
                    <TouchableOpacity
                        style={[styles.checkButton, loading && styles.checkButtonDisabled]}
                        onPress={handleCheckInteractions}
                        disabled={loading || !dbInitialized}
                    >
                        <Text style={styles.checkButtonText}>
                            {loading ? "Checking..." : "Check Interactions"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Results */}
                {results && (
                    <View style={styles.resultsContainer}>
                        <View style={styles.resultsHeader}>
                            <MaterialCommunityIcons
                                name={
                                    results.hasInteractions
                                        ? "alert-circle"
                                        : "check-circle"
                                }
                                size={24}
                                color={
                                    results.hasInteractions
                                        ? "#FF3B30"
                                        : "#34C759"
                                }
                            />
                            <Text style={styles.resultsTitle}>
                                {results.message}
                            </Text>
                        </View>

                        {results.hasInteractions && (
                            <View style={styles.interactionsList}>
                                {results.interactions.map((interaction, index) => {
                                    // Use model methods if available
                                    const severityColor = interaction.getSeverityColor 
                                        ? interaction.getSeverityColor() 
                                        : getSeverityColor(interaction.severity);
                                    const severityLabel = interaction.getSeverityLabel 
                                        ? interaction.getSeverityLabel() 
                                        : getSeverityLabel(interaction.severity);
                                    
                                    return (
                                        <View key={index} style={styles.interactionCard}>
                                            <View style={styles.interactionHeader}>
                                                <Text style={styles.drugPair}>
                                                    {interaction.drugA} + {interaction.drugB}
                                                </Text>
                                                <View
                                                    style={[
                                                        styles.severityBadge,
                                                        {
                                                            backgroundColor: severityColor,
                                                        },
                                                    ]}
                                                >
                                                    <Text style={styles.severityText}>
                                                        {severityLabel}
                                                    </Text>
                                                </View>
                                            </View>
                                        <Text style={styles.description}>
                                            {interaction.description}
                                        </Text>
                                        {interaction.recommendation && (
                                            <View style={styles.recommendationContainer}>
                                                <Text style={styles.recommendationLabel}>
                                                    Recommendation:
                                                </Text>
                                                <Text style={styles.recommendation}>
                                                    {interaction.recommendation}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    );
                                })}
                            </View>
                        )}

                        {!results.hasInteractions && results.checkedDrugs && (
                            <View style={styles.noInteractionsContainer}>
                                <Text style={styles.noInteractionsText}>
                                    No known interactions found between:
                                </Text>
                                <Text style={styles.checkedDrugs}>
                                    {results.checkedDrugs.join(", ")}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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
    content: {
        flex: 1,
        padding: SIZES.padding,
    },
    instructionsContainer: {
        flexDirection: "row",
        backgroundColor: "#F1F4FF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoIcon: {
        marginRight: 12,
    },
    instructionsText: {
        flex: 1,
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    inputSection: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    importButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F4FF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    importButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.primary,
    },
    textInput: {
        backgroundColor: "#F5F5F7",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E5E5",
    },
    checkButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    checkButtonDisabled: {
        backgroundColor: "#CCCCCC",
    },
    checkButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    resultsContainer: {
        marginTop: 8,
    },
    resultsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        marginLeft: 8,
    },
    interactionsList: {
        gap: 12,
    },
    interactionCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    interactionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    drugPair: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        flex: 1,
    },
    severityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    severityText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    description: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 12,
    },
    recommendationContainer: {
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E5E5",
    },
    recommendationLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
        marginBottom: 4,
    },
    recommendation: {
        fontSize: 14,
        color: "#000",
        lineHeight: 20,
    },
    noInteractionsContainer: {
        backgroundColor: "#E8F5E9",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    noInteractionsText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    checkedDrugs: {
        fontSize: 16,
        fontWeight: "600",
        color: "#34C759",
    },
});

export default InteractionCheckerScreen;

