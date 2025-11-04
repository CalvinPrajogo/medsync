import React, { useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Toast = ({ message, visible, onHide, type = "success" }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;

    const slideOut = useCallback(() => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (onHide) {
                onHide();
            }
        });
    }, [slideAnim, onHide]);

    useEffect(() => {
        if (visible) {
            // Slide in
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();

            // Auto hide after 3 seconds
            const timer = setTimeout(() => {
                slideOut();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible, slideAnim, slideOut]);

    if (!visible) return null;

    const iconName = type === "success" ? "check-circle" : "alert-circle";
    const backgroundColor = type === "success" ? "#4CAF50" : "#FF3B30";

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={[styles.toast, { backgroundColor }]}>
                <MaterialCommunityIcons
                    name={iconName}
                    size={20}
                    color={COLORS.white}
                />
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        zIndex: 1000,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    toast: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        minWidth: 200,
        maxWidth: SCREEN_WIDTH - 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    message: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.white,
        marginLeft: 12,
        flex: 1,
    },
});

export default Toast;

