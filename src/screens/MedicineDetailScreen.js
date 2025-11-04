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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MedicineDetailScreen = ({ route, navigation }) => {
    const { medicine } = route.params || {};
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const flatListRef = useRef(null);

    // Placeholder images array - empty for now
    const images = medicine?.images || [];

    // If no images, show placeholder
    const displayImages = images.length > 0 ? images : [null];

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentImageIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / SCREEN_WIDTH);
        setCurrentImageIndex(index);
    };

    const goToImage = (index) => {
        if (flatListRef.current && images.length > 0) {
            flatListRef.current.scrollToIndex({ index, animated: true });
        }
    };

    const renderCarouselItem = ({ item, index }) => {
        if (item === null) {
            // Placeholder when no images
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

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {/* Image Carousel */}
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
                        getItemLayout={(data, index) => ({
                            length: SCREEN_WIDTH,
                            offset: SCREEN_WIDTH * index,
                            index,
                        })}
                        style={styles.carousel}
                    />

                    {/* Image indicators */}
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

                {/* Medicine Details */}
                <View style={styles.detailsContainer}>
                    {/* Name */}
                    <Text style={styles.medicineName}>
                        {medicine?.name || "Medicine Name"}
                    </Text>

                    {/* Dosage */}
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Dosage</Text>
                        <Text style={styles.sectionContent}>
                            {medicine?.dosage || "Dosage information"}
                        </Text>
                    </View>

                    {/* Ingredients */}
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        <Text style={styles.sectionContent}>
                            {medicine?.ingredients || "Ingredients information"}
                        </Text>
                    </View>

                    {/* Instructions */}
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        <Text style={styles.sectionContent}>
                            {medicine?.instructions || "Usage instructions"}
                        </Text>
                    </View>

                    {/* Additional Info */}
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        <Text style={styles.sectionContent}>
                            {medicine?.additionalInfo || "Additional details"}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
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
    scrollView: {
        flex: 1,
    },
    carouselContainer: {
        height: 300,
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
        width: 24,
    },
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
        color: COLORS.primary,
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
    },
});

export default MedicineDetailScreen;

