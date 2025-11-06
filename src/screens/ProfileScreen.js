import React from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../constants/theme";

const ProfileScreen = ({ navigation }) => {
    const menuItems = [
        { icon: "package-variant", label: "My Orders" },
        { icon: "bookmark-outline", label: "My Wishlist" },
        { icon: "pill", label: "My Prescription" },
        { icon: "test-tube", label: "Your Lab Test" },
        { icon: "stethoscope", label: "Doctor Consultation" },
        { icon: "credit-card-outline", label: "Payment Methods" },
        { icon: "map-marker-outline", label: "Your Addresses" },
        { icon: "bell-outline", label: "Pill Reminder" },
        { icon: "account-plus-outline", label: "Invites Friends" },
    ];

    const actionItems = [
        { icon: "logout", label: "Log out", color: "#FF3B30" },
        { icon: "delete-outline", label: "Delete Account", color: "#FF3B30" },
    ];

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
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Profile Section with Purple Background */}
            <View style={styles.profileSection}>
                <LinearGradient
                    colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
                    style={styles.profileGradient}
                >
                    {/* Wavy Background Elements */}
                    <View style={styles.waveContainer}>
                        <View style={styles.wave1} />
                        <View style={styles.wave2} />
                        <View style={styles.wave3} />
                    </View>
                    
                    {/* Light Blue Line */}
                    <View style={styles.blueLine} />

                    {/* Profile Content */}
                    <View style={styles.profileContent}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{
                                    uri: "",
                                }}
                                style={styles.profileImage}
                            />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>Name</Text>
                            <Text style={styles.profileEmail}>name@gmail.com</Text>
                            <Text style={styles.profileDate}>
                                Registered Since Nov 2025
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                            <MaterialCommunityIcons
                                name="pencil"
                                size={20}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={24}
                            color="#666666"
                            style={styles.menuIcon}
                        />
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            color="#CCCCCC"
                        />
                    </TouchableOpacity>
                ))}

                {/* Action Items */}
                {actionItems.map((item, index) => (
                    <TouchableOpacity
                        key={`action-${index}`}
                        style={styles.menuItem}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={24}
                            color={item.color}
                            style={styles.menuIcon}
                        />
                        <Text style={[styles.menuLabel, { color: item.color }]}>
                            {item.label}
                        </Text>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            color="#CCCCCC"
                        />
                    </TouchableOpacity>
                ))}
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
    profileSection: {
        backgroundColor: "#8B5CF6",
        overflow: "hidden",
    },
    profileGradient: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: SIZES.padding,
        position: "relative",
    },
    waveContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
    },
    wave1: {
        position: "absolute",
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "rgba(139, 92, 246, 0.3)",
    },
    wave2: {
        position: "absolute",
        top: 20,
        right: 50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "rgba(124, 58, 237, 0.4)",
    },
    wave3: {
        position: "absolute",
        bottom: -30,
        left: -30,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(109, 40, 217, 0.3)",
    },
    blueLine: {
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "#60A5FA",
        opacity: 0.6,
    },
    profileContent: {
        flexDirection: "row",
        alignItems: "center",
        zIndex: 1,
    },
    profileImageContainer: {
        marginRight: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: "#FFFFFF",
        opacity: 0.9,
        marginBottom: 4,
    },
    profileDate: {
        fontSize: 12,
        color: "#FFFFFF",
        opacity: 0.8,
    },
    editButton: {
        padding: 8,
    },
    menuContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    menuIcon: {
        marginRight: 16,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: "#000000",
    },
});

export default ProfileScreen;

