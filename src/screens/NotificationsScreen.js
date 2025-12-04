import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    FlatList,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
import { COLORS, SIZES } from "../constants/theme";
import { useSchedule } from "../context/ScheduleContext";
import { useAdherence } from "../context/AdherenceContext";

const PENDING_NOTIFICATIONS_KEY = '@notifications:pending';

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { decrementPill } = useSchedule();
    const { markMedicationTaken } = useAdherence();

    const loadNotifications = useCallback(async () => {
        try {
            const raw = await AsyncStorage.getItem(PENDING_NOTIFICATIONS_KEY);
            if (raw) {
                const all = JSON.parse(raw);
                const now = new Date();
                
                // Filter active notifications
                const activeNotifications = all.filter(n => {
                    if (n.completed) return false;
                    const triggerTime = new Date(n.triggerDate);
                    return n.triggered || triggerTime <= now;
                });
                
                activeNotifications.sort((a, b) => new Date(b.triggerDate) - new Date(a.triggerDate));
                
                //get most recent active notification for each medication
                const medicationMap = new Map();
                for (const notification of activeNotifications) {
                    const medName = notification.medicationName;
                    if (!medicationMap.has(medName)) {
                        medicationMap.set(medName, notification);
                    }
                }
                
                // Convertmap to array and sort by trigger date 
                const activeDoses = Array.from(medicationMap.values())
                    .sort((a, b) => new Date(b.triggerDate) - new Date(a.triggerDate));
                
                setNotifications(activeDoses);
            } else {
                setNotifications([]);
            }
        } catch (e) {
            console.warn('Failed to load notifications', e);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
        
        // listener for notifications 
        const receivedListener = Notifications.addNotificationReceivedListener(async (notification) => {
            const scheduleId = notification.request.content.data?.scheduleId;
            const title = notification.request.content.title;
            if (scheduleId && title) {
                try {
                    const raw = await AsyncStorage.getItem(PENDING_NOTIFICATIONS_KEY);
                    if (raw) {
                        const all = JSON.parse(raw);
                        // Find matching notification and mark it as triggered
                        const updated = all.map(n => 
                            (n.scheduleId === scheduleId && n.medicationName === title && !n.completed)
                                ? { ...n, triggered: true, triggeredAt: new Date().toISOString() }
                                : n
                        );
                        await AsyncStorage.setItem(PENDING_NOTIFICATIONS_KEY, JSON.stringify(updated));
                        await loadNotifications();
                    }
                } catch (e) {
                    console.warn('Failed to mark notification as triggered', e);
                }
            }
        });

        // refresh notifications
        const interval = setInterval(loadNotifications, 30000); 
        
        return () => {
            receivedListener.remove();
            clearInterval(interval);
        };
    }, [loadNotifications]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const markAsCompleted = async (notification) => {
        try {
            // Extract medicineId from scheduleId (format: "medicineId-index")
            const medicineId = notification.scheduleId.split('-')[0];
            
            // Get the date and time from triggerDate
            const triggerDate = new Date(notification.triggerDate);
            const today = triggerDate.toISOString().split('T')[0];
            
            // Create a time-only Date object matching the trigger time
            // This matches how doseTimes are stored in the schedule
            const timeOnly = new Date();
            timeOnly.setHours(triggerDate.getHours(), triggerDate.getMinutes(), 0, 0);
            
            console.log('Marking as taken:', {
                medicineId,
                date: today,
                time: timeOnly.toISOString(),
                scheduleId: notification.scheduleId
            });
            
            // Update adherence tracking - pass the Date object
            markMedicationTaken(medicineId, today, timeOnly, true);
            
            // Decrement pill inventory
            decrementPill(medicineId);
            
            // Mark notification as completed in AsyncStorage
            const raw = await AsyncStorage.getItem(PENDING_NOTIFICATIONS_KEY);
            if (raw) {
                const all = JSON.parse(raw);
                const updated = all.map(n => 
                    n.id === notification.id ? { ...n, completed: true, completedAt: new Date().toISOString() } : n
                );
                await AsyncStorage.setItem(PENDING_NOTIFICATIONS_KEY, JSON.stringify(updated));
                await loadNotifications();
            }
        } catch (e) {
            console.warn('Failed to mark notification as completed', e);
        }
    };

    const formatTriggerDate = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = date - now;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 0) return 'Now';
        if (diffMins < 60) return `In ${diffMins} min`;
        if (diffMins < 1440) return `In ${Math.floor(diffMins / 60)} hr`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const renderNotificationCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="pill" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.medicationName}>{item.medicationName}</Text>
                    <Text style={styles.triggerTime}>{formatTriggerDate(item.triggerDate)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => markAsCompleted(item)}
                >
                    <MaterialCommunityIcons name="check-circle-outline" size={28} color="#4CAF50" />
                </TouchableOpacity>
            </View>
        </View>
    );

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
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Notifications List or Empty State */}
            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                        name="bell-outline"
                        size={64}
                        color="#CCCCCC"
                        style={styles.emptyIcon}
                    />
                    <Text style={styles.emptyTitle}>No Notifications</Text>
                    <Text style={styles.emptyMessage}>
                        You don't have any pending medication reminders
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
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
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: SIZES.padding,
    },
    emptyIcon: {
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 12,
    },
    emptyMessage: {
        fontSize: 16,
        color: "#666666",
        textAlign: "center",
        lineHeight: 24,
    },
    listContent: {
        padding: SIZES.padding,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#F0F4FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    medicationName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 4,
    },
    triggerTime: {
        fontSize: 14,
        color: "#666666",
    },
    completeButton: {
        padding: 8,
    },
});

export default NotificationsScreen;

