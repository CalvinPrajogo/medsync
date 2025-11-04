import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import { COLORS, SIZES } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MedicineCard = ({ medicine, onPress, onAdd, showAddButton = false }) => {
    const handleAddPress = (e) => {
        e.stopPropagation();
        if (onAdd) {
            onAdd();
        }
    };

    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {/* Image placeholder */}
                <View style={styles.imageContainer}>
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderText}>📦</Text>
                    </View>
                    {/* Add Button Overlay */}
                    {showAddButton && (
                        <TouchableOpacity
                            style={styles.addButtonOverlay}
                            onPress={handleAddPress}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons
                                name="plus-circle"
                                size={28}
                                color={COLORS.white}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Medicine Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.name} numberOfLines={2}>
                        {medicine?.name || "Medicine Name"}
                    </Text>
                    <Text style={styles.dosage} numberOfLines={1}>
                        {medicine?.dosage || "Dosage"}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: "48%",
        marginBottom: 16,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: "hidden",
    },
    imageContainer: {
        width: "100%",
        height: 140,
        backgroundColor: "#F0F0F0",
        position: "relative",
    },
    addButtonOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E5E5E5",
    },
    imagePlaceholderText: {
        fontSize: 48,
    },
    infoContainer: {
        padding: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
    },
    dosage: {
        fontSize: 14,
        color: "#666",
    },
});

export default MedicineCard;

