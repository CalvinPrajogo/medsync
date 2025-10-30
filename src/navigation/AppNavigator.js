import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import PatientScreen from "../screens/PatientScreen";
import AddPlanScreen from "../screens/AddPlanScreen"

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login" // Start with Login
                screenOptions={{
                    headerShown: false, // Hide default header
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Patient" component={PatientScreen}/>
                <Stack.Screen name="AddPlan" component={AddPlanScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
