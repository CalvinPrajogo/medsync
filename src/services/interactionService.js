import { getDatabase } from "./database";

/**
 * Check for drug interactions between a list of drugs
 * @param {string[]} drugNames - Array of drug names to check
 * @returns {Promise<Object>} - Object containing found interactions
 */
export const checkInteractions = async (drugNames) => {
    try {
        if (!drugNames || drugNames.length < 2) {
            return {
                hasInteractions: false,
                interactions: [],
                message: "Need at least 2 drugs to check for interactions",
            };
        }

        const database = await getDatabase();
        const interactions = [];
        const normalizedDrugs = drugNames.map((drug) => drug.toLowerCase().trim());

        // Check every pair of drugs
        for (let i = 0; i < normalizedDrugs.length; i++) {
            for (let j = i + 1; j < normalizedDrugs.length; j++) {
                const drugA = normalizedDrugs[i];
                const drugB = normalizedDrugs[j];

                // Query database for interaction (check both directions)
                const result = await database.getAllAsync(
                    `SELECT * FROM drug_interactions 
                    WHERE (drug_a = ? AND drug_b = ?) 
                    OR (drug_a = ? AND drug_b = ?)`,
                    [drugA, drugB, drugB, drugA]
                );

                if (result && result.length > 0) {
                    const interaction = result[0];
                    interactions.push({
                        drugA: drugA,
                        drugB: drugB,
                        severity: interaction.severity,
                        description: interaction.description,
                        recommendation: interaction.recommendation,
                    });
                }
            }
        }

        return {
            hasInteractions: interactions.length > 0,
            interactions: interactions,
            checkedDrugs: normalizedDrugs,
            message: interactions.length > 0
                ? `Found ${interactions.length} interaction(s)`
                : "No interactions found",
        };
    } catch (error) {
        console.error("Error checking interactions:", error);
        return {
            hasInteractions: false,
            interactions: [],
            error: error.message,
            message: "Error checking interactions. Please try again.",
        };
    }
};

/**
 * Get all interactions for a specific drug
 * @param {string} drugName - Name of the drug
 * @returns {Promise<Object>} - Object containing all interactions for the drug
 */
export const getDrugInteractions = async (drugName) => {
    try {
        const database = await getDatabase();
        const normalizedDrug = drugName.toLowerCase().trim();

        const result = await database.getAllAsync(
            `SELECT * FROM drug_interactions 
            WHERE drug_a = ? OR drug_b = ?`,
            [normalizedDrug, normalizedDrug]
        );

        return {
            drug: normalizedDrug,
            interactions: result || [],
            count: result?.length || 0,
        };
    } catch (error) {
        console.error("Error getting drug interactions:", error);
        return {
            drug: drugName,
            interactions: [],
            count: 0,
            error: error.message,
        };
    }
};

/**
 * Add a new interaction to the database
 * @param {Object} interaction - Interaction object
 * @returns {Promise<boolean>} - Success status
 */
export const addInteraction = async (interaction) => {
    try {
        const database = await getDatabase();
        
        await database.runAsync(
            `INSERT OR REPLACE INTO drug_interactions 
            (drug_a, drug_b, severity, description, recommendation) 
            VALUES (?, ?, ?, ?, ?)`,
            [
                interaction.drug_a.toLowerCase(),
                interaction.drug_b.toLowerCase(),
                interaction.severity,
                interaction.description || "",
                interaction.recommendation || "",
            ]
        );

        return true;
    } catch (error) {
        console.error("Error adding interaction:", error);
        return false;
    }
};

