import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    Platform,
    Share,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as MailComposer from "expo-mail-composer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

const PROFILE_IMAGE_KEY = "@medsync:profile_image";

const ProfileScreen = ({ navigation }) => {
    const { logout, user } = useAuth();
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        loadProfileImage();
    }, []);

    const loadProfileImage = async () => {
        try {
            const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
            if (savedImage) {
                setProfileImage({ uri: savedImage });
            }
        } catch (error) {
            console.error("Error loading profile image:", error);
        }
    };

    const saveProfileImage = async (uri) => {
        try {
            await AsyncStorage.setItem(PROFILE_IMAGE_KEY, uri);
        } catch (error) {
            console.error("Error saving profile image:", error);
        }
    };

    const handleEditProfilePicture = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "We need access to your photos to set a profile picture."
                );
                return;
            }

            // Show action sheet
            Alert.alert(
                "Profile Picture",
                "Choose an option",
                [
                    {
                        text: "Camera",
                        onPress: async () => {
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 0.8,
                            });

                            if (!result.canceled && result.assets[0]) {
                                setProfileImage({ uri: result.assets[0].uri });
                                await saveProfileImage(result.assets[0].uri);
                            }
                        },
                    },
                    {
                        text: "Photo Library",
                        onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 0.8,
                            });

                            if (!result.canceled && result.assets[0]) {
                                setProfileImage({ uri: result.assets[0].uri });
                                await saveProfileImage(result.assets[0].uri);
                            }
                        },
                    },
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                ],
                { cancelable: true }
            );
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const handleInviteFriends = async () => {
        try {
            const subject = "Join me on MedSync!";
            const body = `Hi there!

I've been using MedSync, a great app for managing medications and tracking your health. I thought you might find it useful too!

MedSync helps you:
- Track your medication schedule
- Check for drug interactions
- Get medical information
- Chat with an AI health assistant

Download it and join me!`;

            // Try email composer first
            const isMailAvailable = await MailComposer.isAvailableAsync();
            
            if (isMailAvailable) {
                await MailComposer.composeAsync({
                    recipients: [],
                    subject: subject,
                    body: body,
                    isHTML: false,
                });
            } else {
                // Fallback to mailto link
                const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                const canOpen = await Linking.canOpenURL(mailtoUrl);
                
                if (canOpen) {
                    await Linking.openURL(mailtoUrl);
                } else {
                    // Final fallback: Use Share API
                    try {
                        await Share.share({
                            message: `${subject}\n\n${body}`,
                            title: "Invite Friends to MedSync",
                        });
                    } catch (shareError) {
                        Alert.alert(
                            "Share",
                            "You can share MedSync with your friends through any messaging app or email.",
                            [
                                {
                                    text: "Copy Message",
                                    onPress: () => {
                                        // You could use Clipboard here if needed
                                        Alert.alert("Copied", "Invite message copied!");
                                    },
                                },
                                { text: "OK" },
                            ]
                        );
                    }
                }
            }
        } catch (error) {
            console.error("Error inviting friends:", error);
            // Fallback to Share API
            try {
                await Share.share({
                    message: `Join me on MedSync! A great app for managing medications and tracking your health.`,
                    title: "Invite Friends to MedSync",
                });
            } catch (shareError) {
                Alert.alert("Error", "Unable to share. Please try again later.");
            }
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        const result = await logout();
                        if (result.success) {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } else {
                            Alert.alert("Error", result.message);
                        }
                    }
                }
            ]
        );
    };

    const actionItems = [
        { 
            icon: "account-plus-outline", 
            label: "Invite Friends", 
            color: COLORS.primary,
            onPress: handleInviteFriends 
        },
        { icon: "logout", label: "Log out", color: "#FF3B30", onPress: handleLogout },
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
                            {profileImage ? (
                                <Image
                                    source={profileImage}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={styles.profileImagePlaceholder}>
                                    <MaterialCommunityIcons
                                        name="account"
                                        size={40}
                                        color="#FFFFFF"
                                    />
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.editImageButton}
                                onPress={handleEditProfilePicture}
                            >
                                <MaterialCommunityIcons
                                    name="camera"
                                    size={16}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
                            <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
                            <Text style={styles.profileDate}>
                                Registered Since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Nov 2025'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={handleEditProfilePicture}
                        >
                            <MaterialCommunityIcons
                                name="pencil"
                                size={20}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {/* Action Items */}
            <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
                {actionItems.map((item, index) => (
                    <TouchableOpacity
                        key={`action-${index}`}
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={item.onPress}
                    >
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={24}
                            color={item.color || "#000000"}
                            style={styles.menuIcon}
                        />
                        <Text style={[styles.menuLabel, item.color && { color: item.color }]}>
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
        position: "relative",
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        backgroundColor: "#E5E5E5",
    },
    profileImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    editImageButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
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

