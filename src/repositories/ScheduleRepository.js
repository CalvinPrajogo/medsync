import { ScheduledMedicine } from '../models/ScheduledMedicine';
import { Medicine } from '../models/Medicine';

/**
 * ScheduleRepository - Data access layer for medication schedule
 */
export class ScheduleRepository {
    constructor(scheduleContext) {
        this.context = scheduleContext;
    }

    /**
     * Get all scheduled medicines
     * @returns {ScheduledMedicine[]}
     */
    getAll() {
        return this.context.scheduledMedicines.map(
            (item) =>
                new ScheduledMedicine({
                    id: item.id,
                    medicine: new Medicine(item),
                    timing: item.timing,
                })
        );
    }

    /**
     * Get medicine names from schedule
     * @returns {string[]}
     */
    getMedicineNames() {
        return this.context.scheduledMedicines
            .map((item) => item.name)
            .filter((name) => name && name.trim().length > 0);
    }

    /**
     * Add medicine to schedule
     * @param {Medicine} medicine - Medicine entity
     * @param {Object} timing - Timing object
     */
    add(medicine, timing) {
        this.context.addToSchedule(medicine, timing);
    }

    /**
     * Remove medicine from schedule
     * @param {number} medicineId - Medicine ID
     */
    remove(medicineId) {
        this.context.removeFromSchedule(medicineId);
    }

    /**
     * Check if schedule is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.context.scheduledMedicines.length === 0;
    }

    /**
     * Get count of scheduled medicines
     * @returns {number}
     */
    getCount() {
        return this.context.scheduledMedicines.length;
    }
}

