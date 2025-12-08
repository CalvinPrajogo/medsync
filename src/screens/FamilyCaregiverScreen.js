import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Modal,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";
import { useFamily } from "../context/FamilyContext";
import { useSchedule } from "../context/ScheduleContext";
import { useAdherence } from "../context/AdherenceContext";

const FamilyCaregiverScreen = ({ navigation }) => {
    const {
        familyMembers,
        selectedMember,
        setSelectedMember,
        addFamilyMember,
        removeFamilyMember,
        addCaregiverRelationship,
        removeCaregiverRelationship,
        getPatientsForCaregiver,
        getCaregiversForPatient,
        isCaregiverFor,
        getAllCaregiverRelationships,
        loadDemoData,
    } = useFamily();
    const { scheduledMedicines } = useSchedule();
    const { calculateAdherence, getAdherenceForDate } = useAdherence();

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showCaregiverModal, setShowCaregiverModal] = useState(false);
    const [activeTab, setActiveTab] = useState("members"); // 'members', 'caregivers', 'reports'
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("patient");
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [selectedCaregiverId, setSelectedCaregiverId] = useState(null);

    const handleAddMember = async () => {
        if (!newMemberName.trim()) {
            Alert.alert("Error", "Please enter a name");
            return;
        }

        try {
            await addFamilyMember({
                name: newMemberName,
                email: newMemberEmail,
                role: newMemberRole,
            });
            setNewMemberName("");
            setNewMemberEmail("");
            setNewMemberRole("patient");
            setShowAddMemberModal(false);
            Alert.alert("Success", "Family member added successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to add family member");
        }
    };

    const handleRemoveMember = (memberId) => {
        const member = familyMembers.find((m) => m.id === memberId);
        Alert.alert(
            "Remove Family Member",
            `Are you sure you want to remove ${member?.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => removeFamilyMember(memberId),
                },
            ]
        );
    };

    const handleAddCaregiver = async (patientId, caregiverId) => {
        try {
            await addCaregiverRelationship(patientId, caregiverId, {
                viewSchedule: true,
                viewAdherence: true,
                manageSchedule: false,
                manageMedications: false,
            });
            setShowCaregiverModal(false);
            Alert.alert("Success", "Caregiver relationship added");
        } catch (error) {
            Alert.alert("Error", "Failed to add caregiver relationship");
        }
    };

    const getAdherenceReport = (memberId) => {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const weekAdherence = calculateAdherence(
            lastWeek.toISOString().split("T")[0],
            today.toISOString().split("T")[0]
        );
        const monthAdherence = calculateAdherence(
            lastMonth.toISOString().split("T")[0],
            today.toISOString().split("T")[0]
        );

        return {
            week: weekAdherence,
            month: monthAdherence,
            totalMedications: scheduledMedicines.length,
        };
    };

    const renderFamilyMember = ({ item }) => {
        const isSelected = selectedMember?.id === item.id;
        const caregivers = getCaregiversForPatient(item.id);
        const report = getAdherenceReport(item.id);

        return (
            <TouchableOpacity
                style={[styles.memberCard, isSelected && styles.memberCardSelected]}
                onPress={() => setSelectedMember(item)}
            >
                <View style={styles.memberHeader}>
                    <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        <Text style={styles.memberRole}>
                            {item.role === "self" ? "You" : item.role}
                        </Text>
                        {item.email && (
                            <Text style={styles.memberEmail}>{item.email}</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveMember(item.id)}
                    >
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={24}
                            color="#FF3B30"
                        />
                    </TouchableOpacity>
                </View>

                {isSelected && (
                    <View style={styles.memberDetails}>
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons
                                name="pill"
                                size={20}
                                color={COLORS.primary}
                            />
                            <Text style={styles.detailText}>
                                {report.totalMedications} medications scheduled
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons
                                name="chart-line"
                                size={20}
                                color={COLORS.primary}
                            />
                            <Text style={styles.detailText}>
                                {report.week}% adherence (7 days)
                            </Text>
                        </View>
                        {caregivers.length > 0 && (
                            <View style={styles.detailRow}>
                                <MaterialCommunityIcons
                                    name="account-group"
                                    size={20}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.detailText}>
                                    {caregivers.length} caregiver(s)
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.viewScheduleButton}
                            onPress={() => {
                                setSelectedMember(item);
                                navigation.navigate("Schedule");
                            }}
                        >
                            <Text style={styles.viewScheduleText}>
                                View Schedule
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderCaregiverCard = ({ item }) => {
        // Handle both direct relationship objects and objects with patient/caregiver
        const patient = item.patient || familyMembers.find((m) => m.id === item.patientId);
        const caregiver = item.caregiver || familyMembers.find((m) => m.id === item.caregiverId);
        
        if (!patient || !caregiver) {
            console.log("Missing patient or caregiver:", { item, patient, caregiver });
            return null;
        }

        const currentUser = familyMembers.find(m => m.role === "self");
        const currentUserId = currentUser?.id;
        const isCurrentUserCaregiver = item.caregiverId === currentUserId || caregiver?.id === currentUserId;

        return (
            <View style={styles.caregiverCard}>
                <View style={styles.caregiverHeader}>
                    <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>
                            {patient.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.caregiverInfo}>
                        <Text style={styles.caregiverName}>
                            {isCurrentUserCaregiver 
                                ? `Caring for: ${patient.name}`
                                : `${caregiver.name} → ${patient.name}`}
                        </Text>
                        <Text style={styles.caregiverRole}>
                            {patient.role === "self" ? "You" : patient.role}
                        </Text>
                        <Text style={styles.caregiverPermissions}>
                            {item.permissions?.manageSchedule
                                ? "Full Access"
                                : "View Only"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeCaregiverRelationship(item.id)}
                    >
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={24}
                            color="#FF3B30"
                        />
                    </TouchableOpacity>
                </View>
                {isCurrentUserCaregiver && (
                    <TouchableOpacity
                        style={styles.viewScheduleButton}
                        onPress={() => {
                            setSelectedMember(patient);
                            navigation.navigate("Schedule");
                        }}
                    >
                        <Text style={styles.viewScheduleText}>View Schedule</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderAdherenceReport = () => {
        const membersWithReports = familyMembers.map((member) => ({
            member,
            report: getAdherenceReport(member.id),
        }));

        return (
            <View style={styles.reportsContainer}>
                <Text style={styles.sectionTitle}>Adherence Reports</Text>
                {membersWithReports.map(({ member, report }) => (
                    <View key={member.id} style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                            <Text style={styles.reportName}>{member.name}</Text>
                            <Text style={styles.reportRole}>
                                {member.role === "self" ? "You" : member.role}
                            </Text>
                        </View>
                        <View style={styles.reportStats}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{report.week}%</Text>
                                <Text style={styles.statLabel}>7 Days</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{report.month}%</Text>
                                <Text style={styles.statLabel}>30 Days</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                    {report.totalMedications}
                                </Text>
                                <Text style={styles.statLabel}>Medications</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.viewDetailsButton}
                            onPress={() => {
                                setSelectedMember(member);
                                navigation.navigate("MedicationHistory");
                            }}
                        >
                            <Text style={styles.viewDetailsText}>
                                View Details
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color="#000"
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>Family & Caregivers</Text>
                <Text style={styles.subtitle}>
                    Manage family members and caregiver access
                </Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "members" && styles.tabActive]}
                    onPress={() => setActiveTab("members")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "members" && styles.tabTextActive,
                        ]}
                    >
                        Members
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "caregivers" && styles.tabActive]}
                    onPress={() => setActiveTab("caregivers")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "caregivers" && styles.tabTextActive,
                        ]}
                    >
                        Caregivers
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "reports" && styles.tabActive]}
                    onPress={() => setActiveTab("reports")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "reports" && styles.tabTextActive,
                        ]}
                    >
                        Reports
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === "members" && (
                    <>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowAddMemberModal(true)}
                        >
                            <MaterialCommunityIcons
                                name="account-plus"
                                size={24}
                                color={COLORS.white}
                            />
                            <Text style={styles.addButtonText}>
                                Add Family Member
                            </Text>
                        </TouchableOpacity>

                        {familyMembers.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons
                                    name="account-group"
                                    size={64}
                                    color="#999"
                                />
                                <Text style={styles.emptyText}>
                                    No family members yet
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    Add family members to manage their medications
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={familyMembers}
                                renderItem={renderFamilyMember}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </>
                )}

                {activeTab === "caregivers" && (
                    <>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.addButton, { flex: 1, marginRight: 8 }]}
                                onPress={() => setShowCaregiverModal(true)}
                            >
                                <MaterialCommunityIcons
                                    name="account-plus"
                                    size={20}
                                    color={COLORS.white}
                                />
                                <Text style={styles.addButtonText}>
                                    Add Caregiver
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.demoButton, { flex: 1, marginLeft: 8 }]}
                                onPress={async () => {
                                    await loadDemoData();
                                    Alert.alert("Success", "Demo data loaded!");
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="refresh"
                                    size={20}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.demoButtonText}>
                                    Load Demo
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Show all caregiver relationships */}
                        {getAllCaregiverRelationships().length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons
                                    name="account-heart"
                                    size={64}
                                    color="#999"
                                />
                                <Text style={styles.emptyText}>
                                    No caregiver relationships
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    Set up caregiver access to manage medications
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.sectionSubtitle}>
                                    All Caregiver Relationships ({getAllCaregiverRelationships().length})
                                </Text>
                                <FlatList
                                    data={getAllCaregiverRelationships()}
                                    renderItem={({ item }) => renderCaregiverCard({ item })}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                />
                                
                                {/* Show relationships where current user is caregiver */}
                                {getPatientsForCaregiver().length > 0 && (
                                    <>
                                        <Text style={styles.sectionSubtitle}>
                                            You are caring for ({getPatientsForCaregiver().length})
                                        </Text>
                                        <FlatList
                                            data={getPatientsForCaregiver()}
                                            renderItem={({ item }) =>
                                                renderCaregiverCard({
                                                    item: item.relationship,
                                                })
                                            }
                                            keyExtractor={(item) => item.relationship.id}
                                            scrollEnabled={false}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                {activeTab === "reports" && renderAdherenceReport()}
            </ScrollView>

            {/* Add Member Modal */}
            <Modal
                visible={showAddMemberModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddMemberModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Family Member</Text>
                            <TouchableOpacity
                                onPress={() => setShowAddMemberModal(false)}
                            >
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color="#000"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>
                            Full Name <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., John Smith or Maria Garcia"
                            value={newMemberName}
                            onChangeText={setNewMemberName}
                            autoCapitalize="words"
                        />
                        
                        <Text style={styles.inputLabel}>
                            Email Address <Text style={styles.optional}>(optional)</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., john.smith@example.com"
                            value={newMemberEmail}
                            onChangeText={setNewMemberEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <View style={styles.roleSelector}>
                            <Text style={styles.roleLabel}>
                                Relationship Role <Text style={styles.required}>*</Text>
                            </Text>
                            <Text style={styles.roleHint}>
                                Select the relationship to you
                            </Text>
                            {[
                                { value: "patient", label: "Patient", desc: "General patient" },
                                { value: "child", label: "Child", desc: "Your child" },
                                { value: "elder", label: "Elder", desc: "Elderly family member" },
                                { value: "spouse", label: "Spouse", desc: "Your spouse/partner" },
                            ].map((role) => (
                                <TouchableOpacity
                                    key={role.value}
                                    style={[
                                        styles.roleOption,
                                        newMemberRole === role.value &&
                                            styles.roleOptionSelected,
                                    ]}
                                    onPress={() => setNewMemberRole(role.value)}
                                >
                                    <View style={styles.roleOptionContent}>
                                        <Text
                                            style={[
                                                styles.roleOptionText,
                                                newMemberRole === role.value &&
                                                    styles.roleOptionTextSelected,
                                            ]}
                                        >
                                            {role.label}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.roleOptionDesc,
                                                newMemberRole === role.value &&
                                                    styles.roleOptionDescSelected,
                                            ]}
                                        >
                                            {role.desc}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.modalButton,
                                !newMemberName.trim() && styles.modalButtonDisabled,
                            ]}
                            onPress={handleAddMember}
                            disabled={!newMemberName.trim()}
                        >
                            <Text style={styles.modalButtonText}>Add Family Member</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Caregiver Modal */}
            <Modal
                visible={showCaregiverModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCaregiverModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Caregiver</Text>
                            <TouchableOpacity
                                onPress={() => setShowCaregiverModal(false)}
                            >
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color="#000"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Select a patient and caregiver to create a relationship
                        </Text>

                        <Text style={styles.sectionLabel}>Patient:</Text>
                        <ScrollView style={styles.memberSelector}>
                            {familyMembers
                                .filter((m) => m.role !== "self")
                                .map((member) => (
                                    <TouchableOpacity
                                        key={member.id}
                                        style={[
                                            styles.memberOption,
                                            selectedPatientId === member.id &&
                                                styles.memberOptionSelected,
                                        ]}
                                        onPress={() => setSelectedPatientId(member.id)}
                                    >
                                        <Text
                                            style={[
                                                styles.memberOptionText,
                                                selectedPatientId === member.id &&
                                                    styles.memberOptionTextSelected,
                                            ]}
                                        >
                                            {member.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                        </ScrollView>

                        <Text style={styles.sectionLabel}>Caregiver:</Text>
                        <ScrollView style={styles.memberSelector}>
                            {familyMembers.map((member) => (
                                <TouchableOpacity
                                    key={member.id}
                                    style={[
                                        styles.memberOption,
                                        selectedCaregiverId === member.id &&
                                            styles.memberOptionSelected,
                                    ]}
                                    onPress={() => setSelectedCaregiverId(member.id)}
                                >
                                    <Text
                                        style={[
                                            styles.memberOptionText,
                                            selectedCaregiverId === member.id &&
                                                styles.memberOptionTextSelected,
                                        ]}
                                    >
                                        {member.name} {member.role === "self" ? "(You)" : ""}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[
                                styles.modalButton,
                                (!selectedPatientId || !selectedCaregiverId) &&
                                    styles.modalButtonDisabled,
                            ]}
                            onPress={() => {
                                if (selectedPatientId && selectedCaregiverId) {
                                    handleAddCaregiver(selectedPatientId, selectedCaregiverId);
                                    setSelectedPatientId(null);
                                    setSelectedCaregiverId(null);
                                }
                            }}
                            disabled={!selectedPatientId || !selectedCaregiverId}
                        >
                            <Text style={styles.modalButtonText}>Add Caregiver</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F7",
    },
    header: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: "row",
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    tabsContainer: {
        flexDirection: "row",
        paddingHorizontal: SIZES.padding,
        marginBottom: 20,
        gap: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        alignItems: "center",
    },
    tabActive: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    tabTextActive: {
        color: COLORS.white,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 20,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "600",
    },
    memberCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    memberCardSelected: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    memberHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    memberAvatarText: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: "bold",
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 4,
    },
    memberRole: {
        fontSize: 14,
        color: "#666",
        marginBottom: 2,
    },
    memberEmail: {
        fontSize: 12,
        color: "#999",
    },
    removeButton: {
        padding: 4,
    },
    memberDetails: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: "#666",
    },
    viewScheduleButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    viewScheduleText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "600",
    },
    caregiverCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    caregiverHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    caregiverInfo: {
        flex: 1,
        marginLeft: 12,
    },
    caregiverName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
    },
    caregiverRole: {
        fontSize: 12,
        color: "#999",
        marginBottom: 2,
        textTransform: "capitalize",
    },
    caregiverPermissions: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    buttonRow: {
        flexDirection: "row",
        marginBottom: 20,
    },
    demoButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    demoButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "600",
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        marginTop: 8,
        marginBottom: 12,
    },
    reportsContainer: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 16,
    },
    reportCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reportHeader: {
        marginBottom: 16,
    },
    reportName: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 4,
    },
    reportRole: {
        fontSize: 14,
        color: "#666",
    },
    reportStats: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#E5E5E5",
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
    },
    viewDetailsButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    viewDetailsText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        paddingHorizontal: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#F5F5F7",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        color: "#000",
    },
    roleSelector: {
        marginBottom: 20,
    },
    roleLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
    },
    roleOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#F5F5F7",
        marginBottom: 8,
    },
    roleOptionSelected: {
        backgroundColor: COLORS.primary,
    },
    roleOptionText: {
        fontSize: 14,
        color: "#666",
    },
    roleOptionTextSelected: {
        color: COLORS.white,
        fontWeight: "600",
    },
    modalButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    modalButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "600",
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
    },
    memberSelector: {
        maxHeight: 200,
        marginBottom: 20,
    },
    memberOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#F5F5F7",
        marginBottom: 8,
    },
    memberOptionText: {
        fontSize: 14,
        color: "#000",
    },
    memberOptionSelected: {
        backgroundColor: COLORS.primary,
    },
    memberOptionTextSelected: {
        color: COLORS.white,
        fontWeight: "600",
    },
    modalButtonDisabled: {
        opacity: 0.5,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
        marginBottom: 8,
        marginTop: 4,
    },
    required: {
        color: "#FF3B30",
    },
    optional: {
        fontSize: 12,
        color: "#999",
        fontWeight: "400",
    },
    roleHint: {
        fontSize: 12,
        color: "#666",
        marginBottom: 12,
        fontStyle: "italic",
    },
    roleOptionContent: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    roleOptionDesc: {
        fontSize: 11,
        color: "#999",
        marginTop: 2,
    },
    roleOptionDescSelected: {
        color: "rgba(255, 255, 255, 0.8)",
    },
});

export default FamilyCaregiverScreen;

