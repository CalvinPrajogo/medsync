import React from "react";
import * as Notifications from 'expo-notifications';

// Ensure notifications are shown when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});
import AppNavigator from "./src/navigation/AppNavigator";
import { ScheduleProvider } from "./src/context/ScheduleContext";
import { AuthProvider } from "./src/context/AuthContext";
import { AdherenceProvider } from "./src/context/AdherenceContext";
import { FamilyProvider } from "./src/context/FamilyContext";

export default function App() {
    return (
        <AuthProvider>
            <AdherenceProvider>
                <ScheduleProvider>
                    <FamilyProvider>
                        <AppNavigator />
                    </FamilyProvider>
                </ScheduleProvider>
            </AdherenceProvider>
        </AuthProvider>
    );
}
