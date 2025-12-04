import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

const FAMILY_STORAGE_KEY = "@family_members";
const CAREGIVER_STORAGE_KEY = "@caregiver_relationships";

const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
    const { user } = useAuth();
    const [familyMembers, setFamilyMembers] = useState([]);
    const [caregiverRelationships, setCaregiverRelationships] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load family data on mount
    useEffect(() => {
        loadFamilyData();
    }, []);

    const loadFamilyData = async () => {
        try {
            const [familyData, caregiverData] = await Promise.all([
                AsyncStorage.getItem(FAMILY_STORAGE_KEY),
                AsyncStorage.getItem(CAREGIVER_STORAGE_KEY),
            ]);

            if (familyData) {
                setFamilyMembers(JSON.parse(familyData));
            } else {
                // Initialize with current user as first member
                const currentUserMember = {
                    id: user?.uid || user?.email || "current-user",
                    name: user?.displayName || user?.email?.split("@")[0] || "You",
                    email: user?.email || "",
                    role: "self",
                    avatar: null,
                    createdAt: new Date().toISOString(),
                };
                setFamilyMembers([currentUserMember]);
                await saveFamilyData([currentUserMember]);
            }

            if (caregiverData) {
                setCaregiverRelationships(JSON.parse(caregiverData));
            }
        } catch (error) {
            console.error("Error loading family data:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveFamilyData = async (members) => {
        try {
            await AsyncStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(members));
        } catch (error) {
            console.error("Error saving family data:", error);
        }
    };

    const saveCaregiverData = async (relationships) => {
        try {
            await AsyncStorage.setItem(CAREGIVER_STORAGE_KEY, JSON.stringify(relationships));
        } catch (error) {
            console.error("Error saving caregiver data:", error);
        }
    };

    /**
     * Add a new family member
     */
    const addFamilyMember = async (memberData) => {
        const newMember = {
            id: `member-${Date.now()}`,
            name: memberData.name,
            email: memberData.email || "",
            role: memberData.role || "patient", // 'patient', 'child', 'elder', etc.
            avatar: memberData.avatar || null,
            dateOfBirth: memberData.dateOfBirth || null,
            createdAt: new Date().toISOString(),
        };

        const updatedMembers = [...familyMembers, newMember];
        setFamilyMembers(updatedMembers);
        await saveFamilyData(updatedMembers);
        return newMember;
    };

    /**
     * Update a family member
     */
    const updateFamilyMember = async (memberId, updates) => {
        const updatedMembers = familyMembers.map((member) =>
            member.id === memberId ? { ...member, ...updates } : member
        );
        setFamilyMembers(updatedMembers);
        await saveFamilyData(updatedMembers);
    };

    /**
     * Remove a family member
     */
    const removeFamilyMember = async (memberId) => {
        const updatedMembers = familyMembers.filter((member) => member.id !== memberId);
        setFamilyMembers(updatedMembers);
        await saveFamilyData(updatedMembers);

        // Also remove caregiver relationships
        const updatedRelationships = caregiverRelationships.filter(
            (rel) => rel.patientId !== memberId && rel.caregiverId !== memberId
        );
        setCaregiverRelationships(updatedRelationships);
        await saveCaregiverData(updatedRelationships);
    };

    /**
     * Add a caregiver relationship
     */
    const addCaregiverRelationship = async (patientId, caregiverId, permissions = {}) => {
        const relationship = {
            id: `rel-${Date.now()}`,
            patientId,
            caregiverId,
            permissions: {
                viewSchedule: permissions.viewSchedule !== false,
                viewAdherence: permissions.viewAdherence !== false,
                manageSchedule: permissions.manageSchedule === true,
                manageMedications: permissions.manageMedications === true,
            },
            createdAt: new Date().toISOString(),
        };

        const updatedRelationships = [...caregiverRelationships, relationship];
        setCaregiverRelationships(updatedRelationships);
        await saveCaregiverData(updatedRelationships);
        return relationship;
    };

    /**
     * Remove a caregiver relationship
     */
    const removeCaregiverRelationship = async (relationshipId) => {
        const updatedRelationships = caregiverRelationships.filter(
            (rel) => rel.id !== relationshipId
        );
        setCaregiverRelationships(updatedRelationships);
        await saveCaregiverData(updatedRelationships);
    };

    /**
     * Check if current user is a caregiver for a patient
     */
    const isCaregiverFor = (patientId) => {
        const currentUserId = user?.uid || user?.email || "current-user";
        return caregiverRelationships.some(
            (rel) => rel.patientId === patientId && rel.caregiverId === currentUserId
        );
    };

    /**
     * Get all patients that current user is caregiver for
     */
    const getPatientsForCaregiver = () => {
        const currentUserId = user?.uid || user?.email || "current-user";
        const relationships = caregiverRelationships.filter(
            (rel) => rel.caregiverId === currentUserId
        );
        return relationships.map((rel) => {
            const patient = familyMembers.find((m) => m.id === rel.patientId);
            return patient ? { ...patient, relationship: rel } : null;
        }).filter(Boolean);
    };

    /**
     * Get all caregivers for a patient
     */
    const getCaregiversForPatient = (patientId) => {
        const relationships = caregiverRelationships.filter(
            (rel) => rel.patientId === patientId
        );
        return relationships.map((rel) => {
            const caregiver = familyMembers.find((m) => m.id === rel.caregiverId);
            return caregiver ? { ...caregiver, relationship: rel } : null;
        }).filter(Boolean);
    };

    const value = {
        familyMembers,
        caregiverRelationships,
        selectedMember,
        loading,
        setSelectedMember,
        addFamilyMember,
        updateFamilyMember,
        removeFamilyMember,
        addCaregiverRelationship,
        removeCaregiverRelationship,
        isCaregiverFor,
        getPatientsForCaregiver,
        getCaregiversForPatient,
    };

    return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
};

export const useFamily = () => {
    const context = useContext(FamilyContext);
    if (!context) {
        throw new Error("useFamily must be used within a FamilyProvider");
    }
    return context;
};

