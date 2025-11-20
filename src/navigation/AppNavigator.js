import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login" 
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
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
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
