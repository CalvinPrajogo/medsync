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

    const formatFrequency = (frequency) => {
        const frequencyMap = {
            daily: "Daily",
            every_other_day: "Every Other Day",
            twice_week: "Twice a Week",
            once_week: "Once a Week",
        };
        return frequencyMap[frequency] || frequency;
    };

    const formatTime = (date) => {
        if (!date) return "";
        const timeDate = new Date(date);
        return timeDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (date) => {
        if (!date) return "";
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const renderScheduleCard = ({ item }) => {
        const timing = item.timing || {};
        const doseTimes = timing.doseTimes || [];
        
        return (
            <View style={styles.scheduleCard}>
                <View style={styles.cardContent}>
                    <View style={styles.medicineInfo}>
                        <Text style={styles.medicineName}>{item.name}</Text>
                        <Text style={styles.dosage}>{item.dosage}</Text>
                        
                        {timing.frequency && (
                            <View style={styles.timingContainer}>
                                <View style={styles.frequencyBadge}>
                                    <MaterialCommunityIcons
                                        name="calendar-refresh"
                                        size={16}
                                        color={COLORS.primary}
                                    />
                                    <Text style={styles.frequencyText}>
                                        {formatFrequency(timing.frequency)}
                                    </Text>
                                </View>
                                
                                {timing.dosesPerDay && (
                                    <Text style={styles.dosesText}>
                                        {timing.dosesPerDay} {timing.dosesPerDay === 1 ? "dose" : "doses"} per day
                                    </Text>
                                )}
                                
                                {timing.nextDoseDate && (
                                    <View style={styles.nextDoseContainer}>
                                        <MaterialCommunityIcons
                                            name="calendar-clock"
                                            size={14}
                                            color="#666"
                                        />
                                        <Text style={styles.nextDoseText}>
                                            Next dose: {formatDate(timing.nextDoseDate)}
                                        </Text>
                                    </View>
                                )}
                                
                                {doseTimes.length > 0 && (
                                    <View style={styles.doseTimesContainer}>
                                        <Text style={styles.doseTimesLabel}>Daily times:</Text>
                                        <View style={styles.timeChips}>
                                            {doseTimes.map((time, index) => (
                                                <View key={index} style={styles.timeChip}>
                                                    <MaterialCommunityIcons
                                                        name="clock-outline"
                                                        size={12}
                                                        color={COLORS.primary}
                                                    />
                                                    <Text style={styles.timeChipText}>
                                                        {formatTime(time)}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
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
        marginTop: 12,
    },
    frequencyBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F4FF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: "flex-start",
        marginBottom: 8,
    },
    frequencyText: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.primary,
        marginLeft: 6,
    },
    dosesText: {
        fontSize: 13,
        color: "#666",
        marginBottom: 6,
    },
    nextDoseContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    nextDoseText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 6,
    },
    doseTimesContainer: {
        marginTop: 4,
    },
    doseTimesLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 6,
        fontWeight: "500",
    },
    timeChips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    timeChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F7",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    timeChipText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333",
        marginLeft: 4,
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