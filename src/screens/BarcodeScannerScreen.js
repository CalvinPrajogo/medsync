import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BarcodeScannerScreen = ({ navigation, route }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [barcodeNotFound, setBarcodeNotFound] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState("");

    // Mock barcode to medicine mapping (in real app, this would come from a database/API)
    const barcodeToMedicine = {
        "1234567890123": "Aspirin",
        "2345678901234": "Ibuprofen",
        "3456789012345": "Paracetamol",
        "4567890123456": "Amoxicillin",
        "5678901234567": "Lisinopril",
        "6789012345678": "Metformin",
    };

    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        if (!permission) {
            const { status } = await requestPermission();
            setHasPermission(status === "granted");
        } else {
            setHasPermission(permission.granted);
        }
    };

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned || barcodeNotFound) return;
        setScanned(true);
        setScannedBarcode(data);

        // Find medicine by barcode
        const medicineName = barcodeToMedicine[data];
        
        if (medicineName) {
            // In a real app, you would fetch the full medicine data from an API
            // For now, we'll navigate to database screen with a search query
            // or create a mock medicine object
            const mockMedicine = createMockMedicine(medicineName);
            
            // Navigate to medicine detail
            setTimeout(() => {
                navigation.navigate("MedicineDetail", { medicine: mockMedicine });
            }, 500);
        } else {
            // Show "not found" UI instead of Alert
            setBarcodeNotFound(true);
        }
    };

    const handleScanAgain = () => {
        setScanned(false);
        setBarcodeNotFound(false);
        setScannedBarcode("");
    };

    const handleAddManually = () => {
        navigation.goBack();
        setTimeout(() => {
            navigation.navigate("Database");
        }, 100);
    };

    const createMockMedicine = (name) => {
        // Create a basic medicine object based on name
        // In a real app, this would come from an API
        const medicines = {
            Aspirin: {
                id: 1,
                name: "Aspirin",
                dosage: "325mg - Take 1-2 tablets every 4-6 hours",
                ingredients: "Acetylsalicylic acid (ASA), Corn starch, Hypromellose",
                instructions: "Take with food or milk to reduce stomach irritation. Do not exceed 4g per day. Avoid if allergic to salicylates.",
                additionalInfo: "Used for pain relief, fever reduction, and anti-inflammatory purposes. Consult doctor before use if pregnant.",
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/3/3b/Aspirin_tablets.jpg",
                ],
            },
            Ibuprofen: {
                id: 2,
                name: "Ibuprofen",
                dosage: "200mg - Take 1 tablet every 4-6 hours as needed",
                ingredients: "Ibuprofen, Microcrystalline cellulose, Croscarmellose sodium",
                instructions: "Take with food or after meals. Maximum 1200mg per day.",
                additionalInfo: "Non-steroidal anti-inflammatory drug (NSAID).",
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/4/4b/Ibuprofen_400mg_tablets.jpg",
                ],
            },
            // Add more mappings as needed
        };

        return medicines[name] || {
            id: 999,
            name: name,
            dosage: "See packaging for dosage information",
            ingredients: "Ingredients not available",
            instructions: "Please consult your healthcare provider",
            additionalInfo: "Information not available in database",
            images: [],
        };
    };

    if (hasPermission === null) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Requesting camera permission...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (hasPermission === false) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <MaterialCommunityIcons
                        name="camera-off"
                        size={64}
                        color="#CCC"
                    />
                    <Text style={styles.permissionText}>Camera permission denied</Text>
                    <Text style={styles.permissionSubtext}>
                        Please enable camera access in settings to scan barcodes
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={requestPermission}
                    >
                        <Text style={styles.buttonText}>Request Permission</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color={COLORS.white}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Barcode</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Camera View */}
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned || barcodeNotFound ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: [
                            "ean13",
                            "ean8",
                            "upc_a",
                            "upc_e",
                            "code128",
                            "code39",
                            "code93",
                            "codabar",
                            "qr",
                        ],
                    }}
                >
                    {/* Scanner Overlay */}
                    <View style={styles.overlay}>
                        <View style={styles.overlayTop} />
                        <View style={styles.overlayMiddle}>
                            <View style={styles.overlaySide} />
                            <View style={styles.scanArea}>
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                            </View>
                            <View style={styles.overlaySide} />
                        </View>
                        <View style={styles.overlayBottom}>
                            <Text style={styles.instructionText}>
                                Position the barcode within the frame
                            </Text>
                        </View>
                    </View>
                </CameraView>
            </View>

            {/* Barcode Not Found Overlay */}
            {barcodeNotFound && (
                <View style={styles.notFoundOverlay}>
                    <View style={styles.notFoundContainer}>
                        <MaterialCommunityIcons
                            name="alert-circle"
                            size={64}
                            color="#FF6B6B"
                        />
                        <Text style={styles.notFoundTitle}>Barcode Not Found</Text>
                        <Text style={styles.notFoundText}>
                            The barcode "{scannedBarcode}" is not in our database.
                        </Text>
                        <Text style={styles.notFoundSubtext}>
                            Would you like to add it manually?
                        </Text>
                        <View style={styles.notFoundButtons}>
                            <TouchableOpacity
                                style={styles.notFoundButton}
                                onPress={handleScanAgain}
                            >
                                <MaterialCommunityIcons
                                    name="barcode-scan"
                                    size={20}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.notFoundButtonText}>Scan Again</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.notFoundButton, styles.notFoundButtonPrimary]}
                                onPress={handleAddManually}
                            >
                                <MaterialCommunityIcons
                                    name="plus-circle"
                                    size={20}
                                    color={COLORS.white}
                                />
                                <Text style={[styles.notFoundButtonText, { color: COLORS.white }]}>
                                    Add Manually
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Bottom Actions */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={handleScanAgain}
                    disabled={!scanned && !barcodeNotFound}
                >
                    <MaterialCommunityIcons
                        name="barcode-scan"
                        size={28}
                        color={(scanned || barcodeNotFound) ? COLORS.primary : "#CCC"}
                    />
                    <Text
                        style={[
                            styles.scanButtonText,
                            { color: (scanned || barcodeNotFound) ? COLORS.primary : "#CCC" },
                        ]}
                    >
                        {scanned || barcodeNotFound ? "Tap to Scan Again" : "Scanning..."}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.manualButton}
                    onPress={() => {
                        navigation.goBack();
                        setTimeout(() => {
                            navigation.navigate("Database");
                        }, 100);
                    }}
                >
                    <MaterialCommunityIcons
                        name="plus-circle"
                        size={20}
                        color={COLORS.white}
                    />
                    <Text style={styles.manualButtonText}>Add Manually</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.white,
    },
    placeholder: {
        width: 40,
    },
    cameraContainer: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    overlayMiddle: {
        flexDirection: "row",
        height: 250,
    },
    overlaySide: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    scanArea: {
        width: 250,
        height: 250,
        position: "relative",
    },
    corner: {
        position: "absolute",
        width: 30,
        height: 30,
        borderColor: COLORS.primary,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 20,
    },
    instructionText: {
        fontSize: 16,
        color: COLORS.white,
        textAlign: "center",
        fontWeight: "500",
    },
    bottomContainer: {
        padding: SIZES.padding,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        gap: 12,
    },
    scanButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
    },
    scanButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    manualButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
    },
    manualButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    permissionText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
        marginTop: 20,
        marginBottom: 8,
    },
    permissionSubtext: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.white,
    },
    notFoundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    notFoundContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 32,
        marginHorizontal: 20,
        alignItems: "center",
        maxWidth: SCREEN_WIDTH - 40,
    },
    notFoundTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginTop: 20,
        marginBottom: 12,
    },
    notFoundText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 8,
    },
    notFoundSubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        marginBottom: 24,
    },
    notFoundButtons: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    notFoundButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
        gap: 8,
    },
    notFoundButtonPrimary: {
        backgroundColor: COLORS.primary,
        borderWidth: 0,
    },
    notFoundButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.primary,
    },
});

export default BarcodeScannerScreen;

