/**
 * DrugInteraction Entity Model
 */
export class DrugInteraction {
    constructor(data) {
        this.id = data.id;
        this.drugA = data.drug_a || data.drugA;
        this.drugB = data.drug_b || data.drugB;
        this.severity = data.severity; // 'major', 'moderate', 'minor'
        this.description = data.description || '';
        this.recommendation = data.recommendation || '';
        this.createdAt = data.created_at || data.createdAt;
    }

    getSeverityColor() {
        switch (this.severity?.toLowerCase()) {
            case 'major':
                return '#FF3B30';
            case 'moderate':
                return '#FF9500';
            case 'minor':
                return '#FFCC00';
            default:
                return '#8E8E93';
        }
    }

    getSeverityLabel() {
        switch (this.severity?.toLowerCase()) {
            case 'major':
                return 'Major';
            case 'moderate':
                return 'Moderate';
            case 'minor':
                return 'Minor';
            default:
                return 'Unknown';
        }
    }
}

