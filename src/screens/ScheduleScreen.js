import React from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSchedule } from "../context/ScheduleContext";

const ScheduleScreen = ({ navigation }) => {
    const { scheduledMedicines, removeFromSchedule } = useSchedule();

    const formatTiming = (timing) => {
        if (!timing) return "Not set";
        const { morning = 0, afternoon = 0, night = 0 } = timing;
        return `${morning}-${afternoon}-${night}`;
    };

    const getTimingLabel = (timing) => {
        if (!timing) return "";
        const { morning = 0, afternoon = 0, night = 0 } = timing;
        const parts = [];
        if (morning > 0) parts.push(`${morning} morning`);
        if (afternoon > 0) parts.push(`${afternoon} afternoon`);
        if (night > 0) parts.push(`${night} night`);
        return parts.join(", ");
    };

    const renderScheduleCard = ({ item }) => {
        return (
            <View style={styles.scheduleCard}>
                <View style={styles.cardContent}>
                    <View style={styles.medicineInfo}>
                        <Text style={styles.medicineName}>{item.name}</Text>
                        <Text style={styles.dosage}>{item.dosage}</Text>
                        <View style={styles.timingContainer}>
                            <View style={styles.timingBadge}>
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={16}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.timingText}>
                                    {formatTiming(item.timing)}
                                </Text>
                            </View>
                            {getTimingLabel(item.timing) && (
                                <Text style={styles.timingLabel}>
                                    {getTimingLabel(item.timing)}
                                </Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFromSchedule(item.id)}
                    >
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={24}
                            color="#FF3B30"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color="#000"
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>Medication Schedule</Text>
                <Text style={styles.subtitle}>
                    Manage your daily medication routine
                </Text>
            </View>

            {/* Schedule List */}
            <View style={styles.content}>
                {scheduledMedicines.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name="calendar-clock"
                            size={64}
                            color="#CCC"
                        />
                        <Text style={styles.emptyText}>
                            No medications scheduled yet
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Add medicines from the database to create your
                            schedule
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={scheduledMedicines}
                        renderItem={renderScheduleCard}
                        keyExtractor={(item) => `schedule-${item.id}`}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F7",
    },
    header: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: "row",
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    content: {
        flex: 1,
        paddingHorizontal: SIZES.padding,
    },
    listContent: {
        paddingBottom: 20,
    },
    scheduleCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    medicineInfo: {
        flex: 1,
    },
    medicineName: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 6,
    },
    dosage: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    timingContainer: {
        marginTop: 4,
    },
    timingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F4FF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: "flex-start",
        marginBottom: 4,
    },
    timingText: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.primary,
        marginLeft: 6,
    },
    timingLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    removeButton: {
        padding: 4,
        marginLeft: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#999",
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        lineHeight: 20,
    },
});

export default ScheduleScreen;

