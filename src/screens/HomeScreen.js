import React from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header with icons */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton}>
                    <Text style={styles.iconText}>👤</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Text style={styles.iconText}>💬</Text>
                </TouchableOpacity>
            </View>

            {/* Main content */}
            <View style={styles.content}>
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.subtitle}>
                    Manage your medications easily
                </Text>

                {/* Action Cards */}
                <View style={styles.cardsContainer}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("Schedule")}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>
                                    View Schedules
                                </Text>
                                <Text style={styles.cardSubtitle}>
                                    View and Manage your medication{"\n"}
                                    schedule
                                </Text>
                            </View>
                            <View style={styles.iconCircle}>
                                <View style={styles.iconPlaceholder} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("BarcodeScanner")}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>
                                    Add Medicine
                                </Text>
                                <Text style={styles.cardSubtitle}>
                                    Scan barcode or QR code to add{"\n"}medicine
                                </Text>
                            </View>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons
                                    name="barcode-scan"
                                    size={36}
                                    color="white"
                                />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("Database")}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>
                                    Search Medicine
                                </Text>
                                <Text style={styles.cardSubtitle}>
                                    Learn more about your meds
                                </Text>
                            </View>
                            <View style={styles.iconCircle}>
                                <View style={styles.iconPlaceholder} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
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
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 10,
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconText: {
        fontSize: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: SIZES.padding,
        paddingTop: 40,
    },
    title: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: "#666",
        marginBottom: 40,
    },
    cardsContainer: {
        gap: 20,
    },
    card: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 24,
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.white,
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        color: COLORS.white,
        opacity: 0.9,
        lineHeight: 20,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 16,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
    scanIcon: {
        fontSize: 32,
        color: COLORS.white,
        fontWeight: "bold",
    },
});

export default HomeScreen;
