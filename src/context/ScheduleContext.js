import React, { createContext, useState, useContext } from "react";

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
    const [scheduledMedicines, setScheduledMedicines] = useState([]);

    const addToSchedule = (medicine, timing, inventory = null) => {
        // Check if medicine already exists in schedule
        const exists = scheduledMedicines.find((item) => item.id === medicine.id);
        
        if (exists) {
            // Update timing and inventory if medicine already exists
            setScheduledMedicines((prev) =>
                prev.map((item) =>
                    item.id === medicine.id 
                        ? { ...item, timing, inventory: inventory || item.inventory } 
                        : item
                )
            );
        } else {
            // Add new medicine to schedule with inventory
            setScheduledMedicines((prev) => [
                ...prev,
                { ...medicine, timing, inventory: inventory || { pillsRemaining: 0, totalPills: 0 } },
            ]);
        }
    };

    const updateInventory = (medicineId, pillsRemaining, totalPills) => {
        setScheduledMedicines((prev) =>
            prev.map((item) =>
                item.id === medicineId
                    ? {
                          ...item,
                          inventory: {
                              pillsRemaining,
                              totalPills,
                              lastUpdated: new Date().toISOString(),
                          },
                      }
                    : item
            )
        );
    };

    const decrementPill = (medicineId) => {
        setScheduledMedicines((prev) =>
            prev.map((item) => {
                if (item.id === medicineId && item.inventory?.pillsRemaining > 0) {
                    return {
                        ...item,
                        inventory: {
                            ...item.inventory,
                            pillsRemaining: item.inventory.pillsRemaining - 1,
                            lastUpdated: new Date().toISOString(),
                        },
                    };
                }
                return item;
            })
        );
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
                updateInventory,
                decrementPill,
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

