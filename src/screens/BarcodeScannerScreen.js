/**
 * ============================================================================
 * BARCODE SCANNER SCREEN
 * ============================================================================
 * 
 * This screen provides barcode scanning functionality for identifying medicines.
 * Features:
 * - Real-time barcode scanning using device camera
 * - Automatic medicine lookup from the database
 * - Navigation to medicine detail screen when found
 * - Error handling for barcodes not in database
 * - Manual entry fallback option
 * 
 * The screen uses Expo Camera's barcode scanner and supports multiple
 * barcode formats including EAN-13, UPC-A, Code 128, QR codes, and more.
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    InteractionManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";
import { findMedicineByBarcode } from "../data/medicinesDatabase";

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// MAIN COMPONENT
// ============================================================================
/**
 * BarcodeScannerScreen Component
 * 
 * A full-screen modal component that allows users to scan barcodes on medicine
 * packages to quickly identify and access medicine information.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object for screen navigation
 * @param {Object} props.route - React Navigation route object
 * @returns {JSX.Element} The barcode scanner screen UI
 */
const BarcodeScannerScreen = ({ navigation, route }) => {
    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================
    const [permission, requestPermission] = useCameraPermissions(); // Camera permission hook from Expo
    const [scanned, setScanned] = useState(false); // Whether a barcode has been scanned
    const [hasPermission, setHasPermission] = useState(null); // Camera permission status
    const [barcodeNotFound, setBarcodeNotFound] = useState(false); // Whether barcode was not found in database
    const [scannedBarcode, setScannedBarcode] = useState(""); // The actual barcode value that was scanned
    const [foundMedicine, setFoundMedicine] = useState(null); // Medicine object if barcode was found

    // ========================================================================
    // EFFECTS
    // ========================================================================
    /**
     * Check camera permissions on component mount
     * Runs once when the component is first rendered
     */
    useEffect(() => {
        checkPermissions();
    }, []);

    /**
     * Navigate to medicine detail screen when a medicine is found
     * This effect watches for changes in foundMedicine and scanned state
     * and navigates to the detail screen after a short delay to ensure
     * state updates are processed
     */
    useEffect(() => {
        if (foundMedicine && scanned) {
            // Small delay ensures the scanned state is properly set before navigation
            // This prevents multiple navigation calls and ensures smooth transition
            const timer = setTimeout(() => {
                // Replace the modal screen with the detail screen
                // Using replace instead of navigate ensures the modal is properly closed
                navigation.replace("MedicineDetail", { medicine: foundMedicine });
            }, 250);
            
            // Cleanup: clear timer if component unmounts before navigation
            return () => clearTimeout(timer);
        }
    }, [foundMedicine, scanned, navigation]);

    // ========================================================================
    // FUNCTIONS
    // ========================================================================
    /**
     * Checks and requests camera permissions from the user
     * 
     * This function handles the camera permission flow:
     * 1. If permission hasn't been requested yet, request it
     * 2. If permission was already requested, use the existing status
     * 3. Update hasPermission state to reflect the current permission status
     */
    const checkPermissions = async () => {
        if (!permission) {
            // First time: request permission
            const { status } = await requestPermission();
            setHasPermission(status === "granted");
        } else {
            // Permission was already requested: use existing status
            setHasPermission(permission.granted);
        }
    };

    /**
     * Handles barcode scanning events from the camera
     * 
     * This function is called when the camera detects a barcode:
     * 1. Prevents multiple scans by checking if already scanned
     * 2. Normalizes the barcode data (handles string/number conversion)
     * 3. Looks up the medicine in the database
     * 4. Either sets the found medicine or shows "not found" UI
     * 
     * @param {Object} barcodeData - Barcode scan event data
     * @param {string} barcodeData.type - Type of barcode (e.g., "ean13", "qr")
     * @param {string|number} barcodeData.data - The scanned barcode value
     */
    const handleBarCodeScanned = ({ type, data }) => {
        // Prevent multiple scans or processing if already handled
        if (scanned || barcodeNotFound || foundMedicine) return;
        
        // Normalize barcode - convert to string and trim whitespace
        // This ensures consistent comparison regardless of scanner output format
        const normalizedBarcode = String(data).trim();
        
        // Find medicine by barcode using the shared database
        // The findMedicineByBarcode function handles various barcode formats
        const medicine = findMedicineByBarcode(normalizedBarcode);
        
        if (medicine) {
            // Medicine found: set states to trigger navigation via useEffect
            setScanned(true); // Mark as scanned to prevent further scans
            setScannedBarcode(normalizedBarcode); // Store the barcode value
            setFoundMedicine(medicine); // Store medicine object - triggers navigation effect
        } else {
            // Medicine not found: show error UI
            setScanned(true); // Mark as scanned
            setScannedBarcode(normalizedBarcode); // Store barcode for display
            setBarcodeNotFound(true); // Show "not found" overlay
        }
    };

    /**
     * Resets the scanner state to allow scanning again
     * 
     * This function clears all scan-related state to allow the user
     * to scan another barcode. Called when user taps "Scan Again" button.
     */
    const handleScanAgain = () => {
        setScanned(false); // Allow new scans
        setBarcodeNotFound(false); // Hide "not found" overlay
        setScannedBarcode(""); // Clear previous barcode
        setFoundMedicine(null); // Clear previous medicine
    };

    /**
     * Navigates to the Database screen for manual medicine entry
     * 
     * This function handles the fallback when a barcode isn't found.
     * It closes the scanner modal and navigates to the database screen
     * where users can search and add medicines manually.
     */
    const handleAddManually = () => {
        // Close the scanner modal first
        navigation.goBack();
        // Small delay ensures modal closes before navigating
        setTimeout(() => {
            navigation.navigate("Database");
        }, 100);
    };

    // ========================================================================
    // PERMISSION STATES - RENDER LOADING OR DENIED UI
    // ========================================================================
    
    // Show loading state while checking permissions
    if (hasPermission === null) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Requesting camera permission...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show permission denied UI if camera access was denied
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

    // ========================================================================
    // MAIN RENDER - SCANNER INTERFACE
    // ========================================================================
    return (
        <SafeAreaView style={styles.container}>
            {/* Header Bar */}
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
                {/* Placeholder to balance the layout (centers title) */}
                <View style={styles.placeholder} />
            </View>

            {/* Camera View with Barcode Scanner */}
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    // Only enable scanning if not already scanned/processed
                    // This prevents multiple rapid scans of the same barcode
                    onBarcodeScanned={scanned || barcodeNotFound || foundMedicine ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        // Supported barcode types
                        // These are the most common formats used on medicine packages
                        barcodeTypes: [
                            "ean13",    // European Article Number (13 digits) - most common on medicines
                            "ean8",     // European Article Number (8 digits)
                            "upc_a",    // Universal Product Code A format
                            "upc_e",    // Universal Product Code E format
                            "code128",  // Code 128 format
                            "code39",   // Code 39 format
                            "code93",   // Code 93 format
                            "codabar",  // Codabar format
                            "qr",       // QR codes (sometimes used for additional info)
                        ],
                    }}
                >
                    {/* Scanner Overlay - Visual guide for positioning barcode */}
                    <View style={styles.overlay}>
                        {/* Top dark overlay area */}
                        <View style={styles.overlayTop} />
                        
                        {/* Middle section with scanning frame */}
                        <View style={styles.overlayMiddle}>
                            {/* Left side dark overlay */}
                            <View style={styles.overlaySide} />
                            
                            {/* Scanning frame with corner indicators */}
                            <View style={styles.scanArea}>
                                {/* Corner brackets to indicate scan area */}
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                            </View>
                            
                            {/* Right side dark overlay */}
                            <View style={styles.overlaySide} />
                        </View>
                        
                        {/* Bottom dark overlay with instructions */}
                        <View style={styles.overlayBottom}>
                            <Text style={styles.instructionText}>
                                Position the barcode within the frame
                            </Text>
                        </View>
                    </View>
                </CameraView>
            </View>

            {/* Barcode Not Found Overlay - Shows when scanned barcode isn't in database */}
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
                            {/* Scan Again Button */}
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
                            
                            {/* Add Manually Button */}
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

            {/* Bottom Action Buttons */}
            <View style={styles.bottomContainer}>
                {/* Scan Again Button - Enabled after scanning */}
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

                {/* Add Manually Button - Always available */}
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

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
    // Main container - full screen with black background
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    
    // Header section with back button and title
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)", // Semi-transparent white
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.white,
    },
    placeholder: {
        width: 40, // Balances the back button width for center alignment
    },
    
    // Camera container and view
    cameraContainer: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    
    // Overlay system for scanning frame
    overlay: {
        flex: 1,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
    },
    overlayMiddle: {
        flexDirection: "row",
        height: 250, // Height of scanning frame
    },
    overlaySide: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark side overlays
    },
    scanArea: {
        width: 250, // Scanning frame width
        height: 250,
        position: "relative",
    },
    // Corner brackets to indicate scan area
    corner: {
        position: "absolute",
        width: 30,
        height: 30,
        borderColor: COLORS.primary, // Primary color for visibility
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
    
    // Bottom action buttons container
    bottomContainer: {
        padding: SIZES.padding,
        backgroundColor: "rgba(0, 0, 0, 0.9)", // Dark background for buttons
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
    
    // Loading state styles
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
    },
    
    // Permission denied state styles
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
    
    // Barcode not found overlay styles
    notFoundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)", // Full screen dark overlay
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000, // Ensure it's above camera view
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
