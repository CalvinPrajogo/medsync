import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";
import { useAdherence } from "../context/AdherenceContext";
import { useSchedule } from "../context/ScheduleContext";

const { width } = Dimensions.get("window");
const CALENDAR_WIDTH = width - SIZES.padding * 2;
const DAY_WIDTH = CALENDAR_WIDTH / 7;

const MedicationHistoryScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { getAdherenceForDate, calculateAdherence, getCurrentStreak } = useAdherence();
    const { scheduledMedicines } = useSchedule();

    // Get current month calendar data
    const getMonthData = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const formatDateKey = (date) => {
        return date.toISOString().split("T")[0];
    };

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSelectedDate = (date) => {
        if (!date) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    const getDateStatus = (date) => {
        if (!date) return "empty";
        
        const dateStr = formatDateKey(date);
        const records = getAdherenceForDate(dateStr);

        if (records.length === 0) return "no-data";

        const allTaken = records.every((record) => record.taken);
        const someTaken = records.some((record) => record.taken);

        if (allTaken) return "complete";
        if (someTaken) return "partial";
        return "missed";
    };

    const changeMonth = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedDate(newDate);
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const monthData = getMonthData(selectedDate);
    const selectedDateRecords = getAdherenceForDate(formatDateKey(selectedDate));
    
    // Calculate stats
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const adherenceRate = calculateAdherence(
        formatDateKey(thirtyDaysAgo),
        formatDateKey(today)
    );
    const currentStreak = getCurrentStreak();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
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
                <Text style={styles.headerTitle}>Medication History</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{adherenceRate}%</Text>
                        <Text style={styles.statLabel}>30-Day Adherence</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{currentStreak}</Text>
                        <Text style={styles.statLabel}>Day Streak 🔥</Text>
                    </View>
                </View>

                {/* Calendar */}
                <View style={styles.calendarContainer}>
                    {/* Month Navigation */}
                    <View style={styles.monthHeader}>
                        <TouchableOpacity onPress={() => changeMonth(-1)}>
                            <MaterialCommunityIcons
                                name="chevron-left"
                                size={32}
                                color={COLORS.primary}
                            />
                        </TouchableOpacity>
                        <Text style={styles.monthText}>
                            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)}>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={32}
                                color={COLORS.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Day Labels */}
                    <View style={styles.dayLabels}>
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                            <Text key={index} style={styles.dayLabel}>
                                {day}
                            </Text>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {monthData.map((date, index) => {
                            const status = getDateStatus(date);
                            const today = isToday(date);
                            const selected = isSelectedDate(date);

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dayCell,
                                        status === "complete" && styles.dayCellComplete,
                                        status === "partial" && styles.dayCellPartial,
                                        status === "missed" && styles.dayCellMissed,
                                        today && styles.dayCellToday,
                                        selected && styles.dayCellSelected,
                                    ]}
                                    onPress={() => date && setSelectedDate(date)}
                                    disabled={!date}
                                >
                                    {date && (
                                        <>
                                            <Text
                                                style={[
                                                    styles.dayText,
                                                    (status === "complete" || status === "partial" || selected) && styles.dayTextWhite,
                                                    today && !selected && styles.dayTextToday,
                                                ]}
                                            >
                                                {date.getDate()}
                                            </Text>
                                            {status === "complete" && (
                                                <MaterialCommunityIcons
                                                    name="check-circle"
                                                    size={16}
                                                    color="#FFF"
                                                    style={styles.statusIcon}
                                                />
                                            )}
                                            {status === "missed" && (
                                                <MaterialCommunityIcons
                                                    name="close-circle"
                                                    size={16}
                                                    color="#FF3B30"
                                                    style={styles.statusIcon}
                                                />
                                            )}
                                        </>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#34C759" }]} />
                            <Text style={styles.legendText}>All Taken</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#FF9500" }]} />
                            <Text style={styles.legendText}>Partially Taken</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#FFE5E5" }]} />
                            <Text style={styles.legendText}>Missed</Text>
                        </View>
                    </View>
                </View>

                {/* Selected Date Details */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.detailsTitle}>
                        {selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </Text>

                    {selectedDateRecords.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="calendar-blank"
                                size={48}
                                color="#CCC"
                            />
                            <Text style={styles.emptyText}>
                                No medication records for this date
                            </Text>
                        </View>
                    ) : (
                        selectedDateRecords.map((record, index) => {
                            const medicine = scheduledMedicines.find(
                                (m) => m.id.toString() === record.medicineId.toString()
                            );
                            return (
                                <View key={index} style={styles.recordCard}>
                                    <View style={styles.recordHeader}>
                                        <Text style={styles.recordName}>
                                            {medicine?.name || "Unknown Medicine"}
                                        </Text>
                                        <MaterialCommunityIcons
                                            name={record.taken ? "check-circle" : "close-circle"}
                                            size={24}
                                            color={record.taken ? "#34C759" : "#FF3B30"}
                                        />
                                    </View>
                                    <Text style={styles.recordTime}>
                                        Scheduled: {record.time}
                                    </Text>
                                    <Text style={styles.recordStatus}>
                                        {record.taken ? "Taken" : "Missed"}
                                    </Text>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F7",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: COLORS.white,
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
        color: "#000",
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: SIZES.padding,
        paddingVertical: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 32,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    calendarContainer: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginBottom: 20,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    monthHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    monthText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    dayLabels: {
        flexDirection: "row",
        marginBottom: 10,
    },
    dayLabel: {
        width: DAY_WIDTH,
        textAlign: "center",
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayCell: {
        width: DAY_WIDTH,
        height: DAY_WIDTH,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginBottom: 4,
    },
    dayCellComplete: {
        backgroundColor: "#34C759",
    },
    dayCellPartial: {
        backgroundColor: "#FF9500",
    },
    dayCellMissed: {
        backgroundColor: "#FFE5E5",
    },
    dayCellToday: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    dayCellSelected: {
        backgroundColor: COLORS.primary,
    },
    dayText: {
        fontSize: 16,
        color: "#000",
    },
    dayTextWhite: {
        color: "#FFF",
    },
    dayTextToday: {
        color: COLORS.primary,
        fontWeight: "bold",
    },
    statusIcon: {
        position: "absolute",
        bottom: 2,
        right: 2,
    },
    legend: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: "#666",
    },
    detailsContainer: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginBottom: 20,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 16,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        marginTop: 12,
    },
    recordCard: {
        backgroundColor: "#F5F5F7",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    recordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    recordName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    recordTime: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    recordStatus: {
        fontSize: 14,
        fontWeight: "500",
        color: "#666",
    },
});

export default MedicationHistoryScreen;
