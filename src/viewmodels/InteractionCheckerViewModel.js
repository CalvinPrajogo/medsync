import { InteractionRepository } from '../repositories/InteractionRepository';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { initDatabase, seedInteractions } from '../services/database';

/**
 * InteractionCheckerViewModel - Presentation logic for interaction checking
 */
export class InteractionCheckerViewModel {
    constructor(scheduleContext = { scheduledMedicines: [] }) {
        this.interactionRepository = new InteractionRepository();
        this.scheduleRepository = new ScheduleRepository(scheduleContext);

        // State
        this.drugList = '';
        this.results = null;
        this.loading = false;
        this.dbInitialized = false;
        this.error = null;
    }

    /**
     * Update schedule context
     * @param {Object} scheduleContext - Updated schedule context
     */
    updateScheduleContext(scheduleContext) {
        this.scheduleRepository = new ScheduleRepository(scheduleContext);
    }

    /**
     * Initialize the database
     */
    async initializeDatabase() {
        try {
            await initDatabase();
            await seedInteractions();
            await this.interactionRepository.initialize();
            this.dbInitialized = true;
            this.error = null;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            this.error = error.message;
            this.dbInitialized = false;
            throw error;
        }
    }

    /**
     * Set the drug list
     * @param {string} drugs - Comma-separated drug names
     */
    setDrugList(drugs) {
        this.drugList = drugs;
    }

    /**
     * Get the current drug list
     * @returns {string}
     */
    getDrugList() {
        return this.drugList;
    }

    /**
     * Import medicines from schedule
     * @returns {number} - Number of medicines imported
     */
    importFromSchedule() {
        if (this.scheduleRepository.isEmpty()) {
            throw new Error(
                "You don't have any medicines in your schedule yet. Add medicines to your schedule first."
            );
        }

        const medicineNames = this.scheduleRepository.getMedicineNames();

        if (medicineNames.length === 0) {
            throw new Error('No valid medicine names found in schedule');
        }

        this.drugList = medicineNames.join(', ');
        this.results = null; // Clear previous results
        this.error = null;

        return medicineNames.length;
    }

    /**
     * Check interactions for the current drug list
     * @returns {Promise<Object>} - Interaction results
     */
    async checkInteractions() {
        if (!this.drugList.trim()) {
            throw new Error('Please enter at least one drug name');
        }

        if (!this.dbInitialized) {
            throw new Error('Database not initialized. Please wait...');
        }

        this.loading = true;
        this.results = null;
        this.error = null;

        try {
            // Parse drug list
            const drugs = this.drugList
                .split(/[,\n]/)
                .map((drug) => drug.trim())
                .filter((drug) => drug.length > 0);

            if (drugs.length < 2) {
                throw new Error('Please enter at least 2 drugs to check for interactions');
            }

            // Check interactions
            const interactions = await this.interactionRepository.checkInteractions(drugs);

            // Build result object
            this.results = {
                hasInteractions: interactions.length > 0,
                interactions: interactions,
                checkedDrugs: drugs,
                message:
                    interactions.length > 0
                        ? `Found ${interactions.length} interaction(s)`
                        : 'No interactions found',
            };
        } catch (error) {
            this.error = error.message;
            throw error;
        } finally {
            this.loading = false;
        }
    }

    /**
     * Get current results
     * @returns {Object|null}
     */
    getResults() {
        return this.results;
    }

    /**
     * Get loading state
     * @returns {boolean}
     */
    isLoading() {
        return this.loading;
    }

    /**
     * Get error message
     * @returns {string|null}
     */
    getError() {
        return this.error;
    }

    /**
     * Check if database is initialized
     * @returns {boolean}
     */
    isDbInitialized() {
        return this.dbInitialized;
    }

    /**
     * Get schedule count
     * @returns {number}
     */
    getScheduleCount() {
        return this.scheduleRepository.getCount();
    }
}

