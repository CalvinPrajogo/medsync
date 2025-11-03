import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { ScheduleProvider } from "./src/context/ScheduleContext";

export default function App() {
    return (
        <ScheduleProvider>
            <AppNavigator />
        </ScheduleProvider>
    );
}
