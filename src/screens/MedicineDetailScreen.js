/**
 * ============================================================================
 * MEDICINE DETAIL SCREEN
 * ============================================================================
 * 
 * This screen displays comprehensive information about a selected medicine.
 * Features:
 * - Image carousel showing multiple medicine images
 * - Detailed medicine information (dosage, ingredients, instructions, etc.)
 * - Add to schedule functionality with timing selection
 * - Smooth scrollable interface for all content
 * 
 * The screen receives medicine data via navigation params and provides
 * options for users to add the medicine to their medication schedule.
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    Dimensions,
    Image,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TimingModal from "../components/TimingModal";
import Toast from "../components/Toast";
import { useSchedule } from "../context/ScheduleContext";

// Get screen width for image carousel calculations
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// MAIN COMPONENT
// ============================================================================
/**
 * MedicineDetailScreen Component
 * 
 * Displays detailed information about a medicine including images, dosage,
 * ingredients, instructions, and additional information. Provides functionality
 * to add the medicine to the user's medication schedule.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.route - React Navigation route object containing medicine data
 * @param {Object} props.route.params - Route parameters
 * @param {Object} props.route.params.medicine - Medicine object with all details
 * @param {Object} props.navigation - React Navigation object for screen navigation
 * @returns {JSX.Element} The medicine detail screen UI
 */
const MedicineDetailScreen = ({ route, navigation }) => {
    // ========================================================================
    // PROPS & STATE
    // ========================================================================
    // Extract medicine data from navigation params
    // Falls back to empty object if not provided
    const { medicine } = route.params || {};
    
    // Image carousel state
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Current visible image index
    const flatListRef = useRef(null); // Reference to FlatList for programmatic scrolling
    
    // Modal and toast state
    const [timingModalVisible, setTimingModalVisible] = useState(false); // Timing modal visibility
    const [toastVisible, setToastVisible] = useState(false); // Toast notification visibility
    const [toastMessage, setToastMessage] = useState(""); // Message to display in toast
    
    // Schedule context hook for adding medicines to schedule
    const { addToSchedule } = useSchedule();

    // ========================================================================
    // COMPUTED VALUES
    // ========================================================================
    /**
     * Get images array from medicine object
     * Falls back to empty array if not available
     */
    const images = medicine?.images || [];

    /**
     * Prepare images for display
     * If no images available, use array with null for placeholder
     */
    const displayImages = images.length > 0 ? images : [null];

    // ========================================================================
    // CAROUSEL HANDLERS
    // ========================================================================
    /**
     * Callback for when viewable items change in the FlatList
     * Updates the current image index to match the visible image
     * Used for synchronizing the indicator dots with the carousel
     */
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            // Update index to match the first visible item
            setCurrentImageIndex(viewableItems[0].index);
        }
    }).current;

    /**
     * Configuration for determining when an item is considered "viewable"
     * Used by FlatList to determine which items are currently visible
     */
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50, // Item must be 50% visible to be considered viewable
    }).current;

    /**
     * Handles scroll events from the image carousel
     * Calculates the current image index based on scroll position
     * Updates the indicator dots accordingly
     * 
     * @param {Object} event - Scroll event object
     */
    const handleScroll = (event) => {
        // Calculate which image is currently visible based on scroll position
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / SCREEN_WIDTH);
        setCurrentImageIndex(index);
    };

    /**
     * Programmatically scrolls to a specific image in the carousel
     * Called when user taps on an indicator dot
     * 
     * @param {number} index - Index of the image to scroll to
     */
    const goToImage = (index) => {
        // Only scroll if FlatList ref exists and there are images
        if (flatListRef.current && images.length > 0) {
            flatListRef.current.scrollToIndex({ index, animated: true });
        }
    };

    // ========================================================================
    // SCHEDULE FUNCTIONS
    // ========================================================================
    /**
     * Opens the timing modal to allow user to set medication schedule
     * Called when user taps "Add to Schedule" button
     */
    const handleAddToSchedule = () => {
        if (medicine) {
            setTimingModalVisible(true);
        }
    };

    /**
     * Handles confirmation from timing modal
     * Adds the medicine to schedule with the specified timing and shows success toast
     * 
     * @param {Object} timing - Timing object with morning, afternoon, night values
     * @param {number} timing.morning - Number of tablets for morning
     * @param {number} timing.afternoon - Number of tablets for afternoon
     * @param {number} timing.night - Number of tablets for night
     */
    const handleConfirmTiming = (timing) => {
        if (medicine) {
            // Add medicine to schedule with timing information
            addToSchedule(medicine, timing);
            
            // Close the modal
            setTimingModalVisible(false);
            
            // Show success toast notification
            setToastMessage(`${medicine.name} added to schedule`);
            setToastVisible(true);
        }
    };

    // ========================================================================
    // RENDER FUNCTIONS
    // ========================================================================
    /**
     * Renders individual carousel item (image or placeholder)
     * 
     * @param {Object} itemData - FlatList item data
     * @param {string|null} itemData.item - Image URL or null for placeholder
     * @param {number} itemData.index - Index of the item
     * @returns {JSX.Element} Carousel item component
     */
    const renderCarouselItem = ({ item, index }) => {
        // If item is null, show placeholder (when no images available)
        if (item === null) {
            return (
                <View style={styles.imageWrapper}>
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderText}>📦</Text>
                        <Text style={styles.imagePlaceholderLabel}>
                            Medicine Image
                        </Text>
                    </View>
                </View>
            );
        }
        
        // Render actual image from URL
        return (
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: item }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                />
            </View>
        );
    };

    // ========================================================================
    // MAIN RENDER
    // ========================================================================
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header with back button */}
            <View style={styles.header}>
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

            {/* Scrollable content area */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {/* Image Carousel Section */}
                <View style={styles.carouselContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={displayImages}
                        renderItem={renderCarouselItem}
                        keyExtractor={(item, index) => `image-${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        // Optimize scrolling performance with item layout
                        getItemLayout={(data, index) => ({
                            length: SCREEN_WIDTH,
                            offset: SCREEN_WIDTH * index,
                            index,
                        })}
                        style={styles.carousel}
                    />

                    {/* Image indicators - only show if multiple images */}
                    {images.length > 1 && (
                        <View style={styles.indicators}>
                            {images.map((_, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.indicator,
                                        currentImageIndex === index &&
                                            styles.indicatorActive,
                                    ]}
                                    onPress={() => goToImage(index)}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Medicine Details Section */}
                <View style={styles.detailsContainer}>
                    {/* Medicine Name */}
                    <Text style={styles.medicineName}>
                        {medicine?.name || "Medicine Name"}
                    </Text>

                    {/* Dosage Information */}
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Dosage</Text>
                        <Text style={styles.sectionContent}>
                            {medicine?.dosage || "Dosage information"}
                        </Text>
                    </View>

                    {/* Ingredients Information */}
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        <Text style={styles.sectionContent}>
                            {medicine?.ingredients || "Ingredients information"}
                        </Text>
                    </View>

                    {/* Usage Instructions */}
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        <Text style={styles.sectionContent}>
                            {medicine?.instructions || "Usage instructions"}
                        </Text>
                    </View>

                    {/* Additional Information */}
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        <Text style={styles.sectionContent}>
                            {medicine?.additionalInfo || "Additional details"}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Add to Schedule Button - Fixed at bottom */}
            {medicine && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddToSchedule}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons
                            name="plus-circle"
                            size={24}
                            color={COLORS.white}
                        />
                        <Text style={styles.addButtonText}>Add to Schedule</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Timing Modal - For setting medication schedule */}
            <TimingModal
                visible={timingModalVisible}
                onClose={() => {
                    setTimingModalVisible(false);
                }}
                onConfirm={handleConfirmTiming}
                medicineName={medicine?.name || ""}
            />

            {/* Toast Notification - Success message */}
            <Toast
                message={toastMessage}
                visible={toastVisible}
                onHide={() => setToastVisible(false)}
                type="success"
            />
        </SafeAreaView>
    );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
    // Main container
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    
    // Header section
    header: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
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
    
    // Scrollable content
    scrollView: {
        flex: 1,
    },
    
    // Image carousel section
    carouselContainer: {
        height: 300, // Fixed height for carousel
        backgroundColor: "#F0F0F0",
    },
    carousel: {
        flex: 1,
    },
    imageWrapper: {
        width: SCREEN_WIDTH,
        height: 300,
    },
    carouselImage: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E5E5E5",
    },
    imagePlaceholderText: {
        fontSize: 64,
        marginBottom: 10,
    },
    imagePlaceholderLabel: {
        fontSize: 16,
        color: "#666",
    },
    
    // Image indicators (dots)
    indicators: {
        position: "absolute",
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
    indicatorActive: {
        backgroundColor: COLORS.white,
        width: 24, // Active indicator is wider
    },
    
    // Details section
    detailsContainer: {
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
    },
    medicineName: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 24,
    },
    detailSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.primary, // Primary color for section titles
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
    },
    
    // Add to schedule button section
    buttonContainer: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 }, // Shadow pointing upward
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
    },
    addButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.white,
    },
});

export default MedicineDetailScreen;
