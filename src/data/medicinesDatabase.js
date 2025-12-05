/**
 * ============================================================================
 * MEDICINES DATABASE
 * ============================================================================
 * 
 * This file contains the shared medicines database and related utility functions
 * used across the application. It provides:
 * - Complete medicine data with detailed information
 * - Barcode to medicine ID mapping for scanner functionality
 * - Helper functions for searching medicines by barcode or name
 * 
 * This centralized database ensures consistency across different screens that
 * need to access medicine information.
 * 
 * ============================================================================
 */

// ============================================================================
// MEDICINES DATA
// ============================================================================
/**
 * Array containing all available medicines in the database.
 * Each medicine object contains:
 * @typedef {Object} Medicine
 * @property {number} id - Unique identifier for the medicine
 * @property {string} name - Name of the medicine
 * @property {string} dosage - Dosage instructions (e.g., "325mg - Take 1-2 tablets every 4-6 hours")
 * @property {string} ingredients - Active and inactive ingredients
 * @property {string} instructions - Detailed usage instructions and warnings
 * @property {string} additionalInfo - Additional important information
 * @property {string[]} images - Array of image URLs for the medicine
 */
export const medicines = [
    {
        id: 1,
        name: "Aspirin",
        dosage: "325mg - Take 1-2 tablets every 4-6 hours",
        ingredients: "Acetylsalicylic acid (ASA), Corn starch, Hypromellose",
        instructions: "Take with food or milk to reduce stomach irritation. Do not exceed 4g per day. Avoid if allergic to salicylates.",
        additionalInfo: "Used for pain relief, fever reduction, and anti-inflammatory purposes. Consult doctor before use if pregnant.",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/3/3b/Aspirin_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/5/5b/Aspirin_500mg_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Aspirin_tablets.jpg/800px-Aspirin_tablets.jpg",
        ],
    },
    {
        id: 2,
        name: "Ibuprofen",
        dosage: "200mg - Take 1 tablet every 4-6 hours as needed",
        ingredients: "Ibuprofen, Microcrystalline cellulose, Croscarmellose sodium",
        instructions: "Take with food or after meals. Maximum 1200mg per day. Do not use for more than 10 days without consulting a physician.",
        additionalInfo: "Non-steroidal anti-inflammatory drug (NSAID). May cause stomach upset. Not recommended for children under 12.",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/4/4b/Ibuprofen_400mg_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/6/6b/Ibuprofen_200mg_tablets.jpg",
        ],
    },
    {
        id: 3,
        name: "Paracetamol",
        dosage: "500mg - Take 1-2 tablets every 4-6 hours",
        ingredients: "Paracetamol (Acetaminophen), Povidone, Stearic acid",
        instructions: "Take with water. Maximum 4g per day for adults. Do not exceed recommended dose.",
        additionalInfo: "Effective for pain and fever. Safe for most people when taken as directed. Avoid alcohol while taking.",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/8/8e/Paracetamol_500mg_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/2e/Paracetamol_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Paracetamol_500mg_tablets.jpg/800px-Paracetamol_500mg_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/1/1b/Paracetamol_syrup.jpg",
        ],
    },
    {
        id: 4,
        name: "Amoxicillin",
        dosage: "500mg - Take 1 capsule three times daily",
        ingredients: "Amoxicillin trihydrate, Gelatin, Magnesium stearate",
        instructions: "Take at evenly spaced intervals. Complete the full course even if you feel better. Take with or without food.",
        additionalInfo: "Antibiotic used to treat bacterial infections. Inform doctor of any allergies. May cause diarrhea.",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/9/9b/Amoxicillin_capsules.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/3/3f/Amoxicillin_500mg_capsules.jpg",
        ],
    },
    {
        id: 5,
        name: "Lisinopril",
        dosage: "10mg - Take 1 tablet once daily",
        ingredients: "Lisinopril dihydrate, Lactose, Cellulose",
        instructions: "Take at the same time each day with or without food. Monitor blood pressure regularly.",
        additionalInfo: "ACE inhibitor for high blood pressure. May cause dry cough. Avoid potassium supplements unless prescribed.",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/8/8b/Lisinopril_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Lisinopril_tablets.jpg/800px-Lisinopril_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/7/7f/Blood_pressure_medication.jpg",
        ],
    },
    {
        id: 6,
        name: "Metformin",
        dosage: "500mg - Take 1-2 tablets twice daily with meals",
        ingredients: "Metformin hydrochloride, Polyvinylpyrrolidone, Magnesium stearate",
        instructions: "Take with meals to reduce stomach upset. Start with lower dose and increase gradually as directed.",
        additionalInfo: "Used to manage type 2 diabetes. May cause nausea initially. Regular blood sugar monitoring recommended.",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/5/5e/Metformin_500mg_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/6/6a/Metformin_850mg_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Metformin_500mg_tablets.jpg/800px-Metformin_500mg_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Metformin_850mg_tablets.jpg/800px-Metformin_850mg_tablets.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/d/d9/Metformin_tablets_various.jpg",
        ],
    },
    {
        id: 7,
        name: "Omeprazole",
        dosage: "20mg - Take 1 capsule once daily before breakfast",
        ingredients: "Omeprazole, Gelatin, Titanium dioxide",
        instructions: "Take on an empty stomach 30 minutes before breakfast. Swallow whole, do not crush or chew.",
        additionalInfo: "Proton pump inhibitor used to treat acid reflux and stomach ulcers. May take a few days to show full effect.",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/9/9b/Omeprazole_capsules.jpg",
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
        ],
    },
    {
        id: 8,
        name: "Atorvastatin",
        dosage: "20mg - Take 1 tablet once daily with or without food",
        ingredients: "Atorvastatin calcium, Lactose, Microcrystalline cellulose",
        instructions: "Take at the same time each day. May take with or without food. Regular cholesterol monitoring recommended.",
        additionalInfo: "Statin medication used to lower cholesterol. May cause muscle pain. Avoid grapefruit juice.",
        images: [
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
        ],
    },
    {
        id: 9,
        name: "Levothyroxine",
        dosage: "50mcg - Take 1 tablet on an empty stomach in the morning",
        ingredients: "Levothyroxine sodium, Calcium phosphate, Magnesium stearate",
        instructions: "Take on an empty stomach 30-60 minutes before breakfast. Do not take with calcium or iron supplements.",
        additionalInfo: "Thyroid hormone replacement. Used to treat hypothyroidism. Regular thyroid function tests required.",
        images: [
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
        ],
    },
    {
        id: 10,
        name: "Amlodipine",
        dosage: "5mg - Take 1 tablet once daily",
        ingredients: "Amlodipine besylate, Lactose, Sodium starch glycolate",
        instructions: "Take at the same time each day with or without food. May cause dizziness initially.",
        additionalInfo: "Calcium channel blocker for high blood pressure and chest pain. May cause ankle swelling.",
        images: [
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
        ],
    },
    {
        id: 11,
        name: "Gabapentin",
        dosage: "300mg - Take 1 capsule three times daily",
        ingredients: "Gabapentin, Gelatin, Talc",
        instructions: "Take with food. Do not stop suddenly - reduce gradually. May cause drowsiness.",
        additionalInfo: "Used for nerve pain and seizures. Avoid alcohol. May impair ability to drive.",
        images: [
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
        ],
    },
    {
        id: 12,
        name: "Sertraline",
        dosage: "50mg - Take 1 tablet once daily",
        ingredients: "Sertraline hydrochloride, Lactose, Hydroxypropyl cellulose",
        instructions: "Take with or without food at the same time each day. May take 4-6 weeks to show full effect.",
        additionalInfo: "SSRI antidepressant. Do not stop abruptly. May cause nausea or insomnia initially.",
        images: [
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
        ],
    },
    {
        id: 13,
        name: "Ciprofloxacin",
        dosage: "500mg - Take 1 tablet twice daily",
        ingredients: "Ciprofloxacin hydrochloride, Cellulose, Magnesium stearate",
        instructions: "Take with a full glass of water. Avoid dairy products and antacids 2 hours before or after.",
        additionalInfo: "Antibiotic for bacterial infections. May cause tendon problems. Avoid sun exposure.",
        images: [
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
        ],
    },
    {
        id: 14,
        name: "Warfarin",
        dosage: "5mg - Take 1 tablet once daily at the same time",
        ingredients: "Warfarin sodium, Lactose, Starch",
        instructions: "Take at the same time each day. Regular blood tests (INR) required. Maintain consistent vitamin K intake.",
        additionalInfo: "Blood thinner to prevent clots. Avoid alcohol. Watch for bleeding signs. Many drug interactions.",
        images: [
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
        ],
    },
    {
        id: 15,
        name: "Furosemide",
        dosage: "40mg - Take 1-2 tablets once or twice daily",
        ingredients: "Furosemide, Lactose, Corn starch",
        instructions: "Take with or without food. May cause increased urination. Monitor fluid intake and weight.",
        additionalInfo: "Diuretic (water pill) for fluid retention and high blood pressure. May cause low potassium.",
        images: [
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
        ],
    },
];

// ============================================================================
// BARCODE MAPPING
// ============================================================================
/**
 * Maps barcode numbers (as strings) to medicine IDs.
 * This mapping is used by the barcode scanner to identify medicines when
 * a barcode is scanned.
 * 
 * Format: { "barcode_string": medicine_id }
 * 
 * Note: Different barcode scanners may return barcodes with varying formats
 * (with/without leading zeros), so the findMedicineByBarcode function
 * handles normalization.
 */
export const barcodeToMedicineId = {
    "1234567890123": 1, // Aspirin
    "2345678901234": 2, // Ibuprofen
    "3456789012345": 3, // Paracetamol
    "4567890123456": 4, // Amoxicillin
    "5678901234567": 5, // Lisinopril
    "6789012345678": 6, // Metformin
    "7890123456789": 7, // Omeprazole
    "8901234567890": 8, // Atorvastatin
    "9012345678901": 9, // Levothyroxine
    "0123456789012": 10, // Amlodipine
    "1111111111111": 11, // Gabapentin
    "2222222222222": 12, // Sertraline
    "3333333333333": 13, // Ciprofloxacin
    "4444444444444": 14, // Warfarin
    "5555555555555": 15, // Furosemide
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Finds a medicine by its barcode number.
 * 
 * This function performs multiple lookup strategies to handle different
 * barcode formats that may be returned by various scanners:
 * 1. Direct lookup with the provided barcode
 * 2. Lookup with leading zeros removed (some scanners add leading zeros)
 * 3. Lookup with leading zeros added (for shorter barcodes)
 * 
 * @param {string|number} barcode - The barcode to search for (will be normalized)
 * @returns {Medicine|null} The medicine object if found, null otherwise
 * 
 * @example
 * const medicine = findMedicineByBarcode("1234567890123");
 * if (medicine) {
 *     console.log(medicine.name); // "Aspirin"
 * }
 */
export const findMedicineByBarcode = (barcode) => {
    // Normalize barcode - convert to string and remove whitespace
    // This ensures consistent comparison regardless of input type
    const normalizedBarcode = String(barcode).trim();
    
    // Strategy 1: Try direct lookup first (most common case)
    let medicineId = barcodeToMedicineId[normalizedBarcode];
    
    // Strategy 2: If not found, try with leading zeros removed
    // Some barcode scanners may prepend zeros to shorter barcodes
    if (!medicineId) {
        const withoutLeadingZeros = normalizedBarcode.replace(/^0+/, '');
        // Only try if the barcode actually had leading zeros removed
        if (withoutLeadingZeros !== normalizedBarcode) {
            medicineId = barcodeToMedicineId[withoutLeadingZeros];
        }
    }
    
    // Strategy 3: If still not found, try padding with leading zeros
    // Some scanners may strip leading zeros from shorter barcodes
    if (!medicineId && normalizedBarcode.length < 13) {
        const paddedBarcode = normalizedBarcode.padStart(13, '0');
        medicineId = barcodeToMedicineId[paddedBarcode];
    }
    
    // If a medicine ID was found, retrieve the full medicine object
    if (medicineId) {
        const medicine = medicines.find((medicine) => medicine.id === medicineId);
        return medicine || null;
    }
    
    // Return null if no match was found
    return null;
};

/**
 * Finds a medicine by its name (case-insensitive).
 * 
 * This function performs a case-insensitive search through the medicines
 * array to find a matching medicine by name.
 * 
 * @param {string} name - The name of the medicine to search for
 * @returns {Medicine|undefined} The medicine object if found, undefined otherwise
 * 
 * @example
 * const medicine = findMedicineByName("aspirin");
 * if (medicine) {
 *     console.log(medicine.dosage); // "325mg - Take 1-2 tablets..."
 * }
 */
export const findMedicineByName = (name) => {
    return medicines.find(
        (medicine) => medicine.name.toLowerCase() === name.toLowerCase()
    );
};
