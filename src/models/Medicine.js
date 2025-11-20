/**
 * Medicine Entity Model
 */
export class Medicine {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.dosage = data.dosage || '';
        this.ingredients = data.ingredients || '';
        this.instructions = data.instructions || '';
        this.additionalInfo = data.additionalInfo || '';
        this.images = data.images || [];
    }
}

