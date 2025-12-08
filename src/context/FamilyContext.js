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

    /**
     * Load demo data (for testing)
     */
    const loadDemoData = async () => {
        const currentUserMember = {
            id: user?.uid || user?.email || "current-user",
            name: user?.displayName || user?.email?.split("@")[0] || "You",
            email: user?.email || "",
            role: "self",
            avatar: null,
            createdAt: new Date().toISOString(),
        };
        
        const demoMembers = [
            currentUserMember,
            {
                id: "demo-member-1",
                name: "Sarah Johnson",
                email: "sarah.johnson@example.com",
                role: "spouse",
                avatar: null,
                createdAt: new Date().toISOString(),
            },
            {
                id: "demo-member-2",
                name: "Emma Johnson",
                email: "",
                role: "child",
                avatar: null,
                createdAt: new Date().toISOString(),
            },
            {
                id: "demo-member-3",
                name: "Robert Johnson",
                email: "robert.johnson@example.com",
                role: "elder",
                avatar: null,
                createdAt: new Date().toISOString(),
            },
        ];
        
        const currentUserId = user?.uid || user?.email || "current-user";
        const demoRelationships = [
            {
                id: "demo-rel-1",
                patientId: "demo-member-2", // Emma (child)
                caregiverId: currentUserId, // Current user is caregiver
                permissions: {
                    viewSchedule: true,
                    viewAdherence: true,
                    manageSchedule: true,
                    manageMedications: true,
                },
                createdAt: new Date().toISOString(),
            },
            {
                id: "demo-rel-2",
                patientId: "demo-member-3", // Robert (elder)
                caregiverId: currentUserId, // Current user is caregiver
                permissions: {
                    viewSchedule: true,
                    viewAdherence: true,
                    manageSchedule: false,
                    manageMedications: false,
                },
                createdAt: new Date().toISOString(),
            },
            {
                id: "demo-rel-3",
                patientId: "demo-member-1", // Sarah (spouse)
                caregiverId: "demo-member-3", // Robert is caregiver for Sarah
                permissions: {
                    viewSchedule: true,
                    viewAdherence: true,
                    manageSchedule: false,
                    manageMedications: false,
                },
                createdAt: new Date().toISOString(),
            },
        ];
        
        setFamilyMembers(demoMembers);
        setCaregiverRelationships(demoRelationships);
        await saveFamilyData(demoMembers);
        await saveCaregiverData(demoRelationships);
    };

    const loadFamilyData = async () => {
        try {
            const [familyData, caregiverData] = await Promise.all([
                AsyncStorage.getItem(FAMILY_STORAGE_KEY),
                AsyncStorage.getItem(CAREGIVER_STORAGE_KEY),
            ]);

            if (familyData) {
                setFamilyMembers(JSON.parse(familyData));
            } else {
                // Load demo data on first launch
                await loadDemoData();
            }

            if (caregiverData) {
                const parsed = JSON.parse(caregiverData);
                setCaregiverRelationships(parsed);
                console.log("Loaded caregiver relationships:", parsed);
            } else {
                // Load demo data if no caregiver data exists
                await loadDemoData();
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

    /**
     * Get all caregiver relationships (for display)
     */
    const getAllCaregiverRelationships = () => {
        return caregiverRelationships.map((rel) => {
            const patient = familyMembers.find((m) => m.id === rel.patientId);
            const caregiver = familyMembers.find((m) => m.id === rel.caregiverId);
            return {
                ...rel,
                patient,
                caregiver,
            };
        }).filter((rel) => rel.patient && rel.caregiver);
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
        getAllCaregiverRelationships,
        loadDemoData,
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

