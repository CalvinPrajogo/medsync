import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { ScheduleProvider } from "./src/context/ScheduleContext";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
    return (
        <AuthProvider>
            <ScheduleProvider>
                <AppNavigator />
            </ScheduleProvider>
        </AuthProvider>
    );
}
