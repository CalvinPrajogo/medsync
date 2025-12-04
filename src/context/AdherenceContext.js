import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ADHERENCE_STORAGE_KEY = "@medication_adherence";

const AdherenceContext = createContext();

export const AdherenceProvider = ({ children }) => {
    const [adherenceHistory, setAdherenceHistory] = useState({});
    const [loading, setLoading] = useState(true);

    // Load adherence history from AsyncStorage on mount
    useEffect(() => {
        loadAdherenceHistory();
    }, []);

    const loadAdherenceHistory = async () => {
        try {
            const stored = await AsyncStorage.getItem(ADHERENCE_STORAGE_KEY);
            if (stored) {
                setAdherenceHistory(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Error loading adherence history:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveAdherenceHistory = async (history) => {
        try {
            await AsyncStorage.setItem(ADHERENCE_STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Error saving adherence history:", error);
        }
    };

    /**
     * Mark a medication as taken for a specific date and time
     * @param {string} medicineId - Medicine ID
     * @param {string} date - Date string (YYYY-MM-DD)
     * @param {string} time - Time string (HH:MM)
     * @param {boolean} taken - Whether medication was taken
     */
    const markMedicationTaken = (medicineId, date, time, taken = true) => {
        const key = `${medicineId}-${date}-${time}`;
        const newHistory = {
            ...adherenceHistory,
            [key]: {
                medicineId,
                date,
                time,
                taken,
                timestamp: new Date().toISOString(),
            },
        };
        setAdherenceHistory(newHistory);
        saveAdherenceHistory(newHistory);
    };

    /**
     * Get adherence status for a specific medication, date, and time
     * @param {string} medicineId - Medicine ID
     * @param {string} date - Date string (YYYY-MM-DD)
     * @param {string} time - Time string (HH:MM)
     * @returns {boolean|null} True if taken, false if missed, null if not recorded
     */
    const getMedicationStatus = (medicineId, date, time) => {
        const key = `${medicineId}-${date}-${time}`;
        return adherenceHistory[key]?.taken ?? null;
    };

    /**
     * Get all adherence records for a specific date
     * @param {string} date - Date string (YYYY-MM-DD)
     * @returns {Object} Adherence records for the date
     */
    const getAdherenceForDate = (date) => {
        return Object.values(adherenceHistory).filter(
            (record) => record.date === date
        );
    };

    /**
     * Calculate adherence percentage for a date range
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {number} Adherence percentage (0-100)
     */
    const calculateAdherence = (startDate, endDate) => {
        const records = Object.values(adherenceHistory).filter((record) => {
            return record.date >= startDate && record.date <= endDate;
        });

        if (records.length === 0) return 0;

        const takenCount = records.filter((record) => record.taken).length;
        return Math.round((takenCount / records.length) * 100);
    };

    /**
     * Get medication streak (consecutive days with 100% adherence)
     * @returns {number} Current streak in days
     */
    const getCurrentStreak = () => {
        const today = new Date();
        let streak = 0;
        let checkDate = new Date(today);

        while (true) {
            const dateStr = checkDate.toISOString().split("T")[0];
            const dayRecords = getAdherenceForDate(dateStr);

            if (dayRecords.length === 0) break;

            const allTaken = dayRecords.every((record) => record.taken);
            if (!allTaken) break;

            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        return streak;
    };

    const value = {
        adherenceHistory,
        loading,
        markMedicationTaken,
        getMedicationStatus,
        getAdherenceForDate,
        calculateAdherence,
        getCurrentStreak,
    };

    return (
        <AdherenceContext.Provider value={value}>
            {children}
        </AdherenceContext.Provider>
    );
};

export const useAdherence = () => {
    const context = useContext(AdherenceContext);
    if (!context) {
        throw new Error("useAdherence must be used within an AdherenceProvider");
    }
    return context;
};
