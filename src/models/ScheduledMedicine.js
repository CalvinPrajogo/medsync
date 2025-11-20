/**
 * ScheduledMedicine Entity Model
 */
export class ScheduledMedicine {
    constructor(data) {
        this.id = data.id;
        this.medicine = data.medicine; // Medicine entity
        this.timing = {
            morning: data.timing?.morning || 0,
            afternoon: data.timing?.afternoon || 0,
            night: data.timing?.night || 0,
        };
    }

    formatTiming() {
        const { morning = 0, afternoon = 0, night = 0 } = this.timing;
        return `${morning}-${afternoon}-${night}`;
    }

    getTimingLabel() {
        const { morning = 0, afternoon = 0, night = 0 } = this.timing;
        const parts = [];
        if (morning > 0) parts.push(`${morning} morning`);
        if (afternoon > 0) parts.push(`${afternoon} afternoon`);
        if (night > 0) parts.push(`${night} night`);
        return parts.join(', ');
    }
}

