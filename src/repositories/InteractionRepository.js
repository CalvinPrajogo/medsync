import { DrugInteraction } from '../models/DrugInteraction';
import { getDatabase } from '../services/database';

/**
 * InteractionRepository - Data access layer for drug interactions
 */
export class InteractionRepository {
    constructor() {
        this.db = null;
    }

    async initialize() {
        if (!this.db) {
            this.db = await getDatabase();
        }
        return this.db;
    }

    /**
     * Check for interactions between multiple drugs
     * @param {string[]} drugNames - Array of drug names
     * @returns {Promise<DrugInteraction[]>} - Array of found interactions
     */
    async checkInteractions(drugNames) {
        await this.initialize();
        const interactions = [];
        const normalizedDrugs = drugNames.map((drug) => drug.toLowerCase().trim());

        // Check every pair of drugs
        for (let i = 0; i < normalizedDrugs.length; i++) {
            for (let j = i + 1; j < normalizedDrugs.length; j++) {
                const drugA = normalizedDrugs[i];
                const drugB = normalizedDrugs[j];

                // Query database for interaction (check both directions)
                const result = await this.db.getAllAsync(
                    `SELECT * FROM drug_interactions 
                    WHERE (drug_a = ? AND drug_b = ?) 
                    OR (drug_a = ? AND drug_b = ?)`,
                    [drugA, drugB, drugB, drugA]
                );

                if (result && result.length > 0) {
                    const interaction = result[0];
                    interactions.push(
                        new DrugInteraction({
                            id: interaction.id,
                            drug_a: interaction.drug_a,
                            drug_b: interaction.drug_b,
                            severity: interaction.severity,
                            description: interaction.description,
                            recommendation: interaction.recommendation,
                            created_at: interaction.created_at,
                        })
                    );
                }
            }
        }

        return interactions;
    }

    /**
     * Get all interactions for a specific drug
     * @param {string} drugName - Name of the drug
     * @returns {Promise<DrugInteraction[]>} - Array of interactions
     */
    async getByDrug(drugName) {
        await this.initialize();
        const normalizedDrug = drugName.toLowerCase().trim();

        const result = await this.db.getAllAsync(
            `SELECT * FROM drug_interactions 
            WHERE drug_a = ? OR drug_b = ?`,
            [normalizedDrug, normalizedDrug]
        );

        return (result || []).map(
            (item) =>
                new DrugInteraction({
                    id: item.id,
                    drug_a: item.drug_a,
                    drug_b: item.drug_b,
                    severity: item.severity,
                    description: item.description,
                    recommendation: item.recommendation,
                    created_at: item.created_at,
                })
        );
    }

    /**
     * Add a new interaction to the database
     * @param {Object} interaction - Interaction data
     * @returns {Promise<boolean>} - Success status
     */
    async addInteraction(interaction) {
        await this.initialize();
        try {
            await this.db.runAsync(
                `INSERT OR REPLACE INTO drug_interactions 
                (drug_a, drug_b, severity, description, recommendation) 
                VALUES (?, ?, ?, ?, ?)`,
                [
                    interaction.drug_a.toLowerCase(),
                    interaction.drug_b.toLowerCase(),
                    interaction.severity,
                    interaction.description || '',
                    interaction.recommendation || '',
                ]
            );
            return true;
        } catch (error) {
            console.error('Error adding interaction:', error);
            return false;
        }
    }
}

