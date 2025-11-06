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

const NotificationsScreen = ({ navigation }) => {
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

            {/* Empty State */}
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                    name="bell-outline"
                    size={64}
                    color="#CCCCCC"
                    style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptyMessage}>
                    You don't have any new notifications or anything to display
                </Text>
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
});

export default NotificationsScreen;

