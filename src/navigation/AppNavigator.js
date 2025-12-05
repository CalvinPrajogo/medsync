import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../screens/LoadingScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import HomeScreen from "../screens/HomeScreen";
import DatabaseScreen from "../screens/DatabaseScreen";
import MedicineDetailScreen from "../screens/MedicineDetailScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import BarcodeScannerScreen from "../screens/BarcodeScannerScreen";
import ProfileScreen from "../screens/ProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import InteractionCheckerScreen from "../screens/InteractionCheckerScreen";
import MedicationHistoryScreen from "../screens/MedicationHistoryScreen";
import TermsAndConditionsScreen from "../screens/TermsAndConditionsScreen";
import FamilyCaregiverScreen from "../screens/FamilyCaregiverScreen";

const TERMS_ACCEPTED_KEY = "@medsync:terms_accepted";
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, loading } = useAuth();
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const checkAuthAndSetRoute = async () => {
            if (loading) return;
            
            // Only set initial route once
            if (initialRoute !== null) return;
            
            if (user) {
                // User is logged in - check terms
                try {
                    const termsAccepted = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
                    if (termsAccepted === "true") {
                        setInitialRoute("Home");
                    } else {
                        setInitialRoute("TermsAndConditions");
                    }
                } catch (error) {
                    console.error("Error checking terms:", error);
                    setInitialRoute("TermsAndConditions");
                }
            } else {
                // User is not logged in
                setInitialRoute("Login");
            }
        };

        checkAuthAndSetRoute();
    }, [user, loading, initialRoute]);

    // Show loading screen while checking auth state
    if (loading || !initialRoute) {
        return (
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Loading" component={LoadingScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Database" component={DatabaseScreen} />
                <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
                <Stack.Screen name="Schedule" component={ScheduleScreen} />
                <Stack.Screen 
                    name="BarcodeScanner" 
                    component={BarcodeScannerScreen}
                    options={{ presentation: "fullScreenModal" }}
                />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="Chatbot" component={ChatbotScreen} />
                <Stack.Screen name="InteractionChecker" component={InteractionCheckerScreen} />
                <Stack.Screen name="MedicationHistory" component={MedicationHistoryScreen} />
                <Stack.Screen name="FamilyCaregiver" component={FamilyCaregiverScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
