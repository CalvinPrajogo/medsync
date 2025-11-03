import React, { createContext, useState, useContext } from "react";

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
    const [scheduledMedicines, setScheduledMedicines] = useState([]);

    const addToSchedule = (medicine, timing) => {
        // Check if medicine already exists in schedule
        const exists = scheduledMedicines.find((item) => item.id === medicine.id);
        
        if (exists) {
            // Update timing if medicine already exists
            setScheduledMedicines((prev) =>
                prev.map((item) =>
                    item.id === medicine.id ? { ...item, timing } : item
                )
            );
        } else {
            // Add new medicine to schedule
            setScheduledMedicines((prev) => [
                ...prev,
                { ...medicine, timing },
            ]);
        }
    };

    const removeFromSchedule = (medicineId) => {
        setScheduledMedicines((prev) =>
            prev.filter((item) => item.id !== medicineId)
        );
    };

    return (
        <ScheduleContext.Provider
            value={{
                scheduledMedicines,
                addToSchedule,
                removeFromSchedule,
            }}
        >
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedule = () => {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error("useSchedule must be used within a ScheduleProvider");
    }
    return context;
};

