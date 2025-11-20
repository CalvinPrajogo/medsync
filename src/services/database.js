import * as SQLite from "expo-sqlite";

let db = null;

// Initialize database
export const initDatabase = async () => {
    try {
        db = await SQLite.openDatabaseAsync("medsync.db");
        
        // Create drug_interactions table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS drug_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                drug_a TEXT NOT NULL,
                drug_b TEXT NOT NULL,
                severity TEXT NOT NULL,
                description TEXT,
                recommendation TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(drug_a, drug_b)
            );
        `);

        // Create index for faster lookups
        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_drug_pair 
            ON drug_interactions(drug_a, drug_b);
        `);

        console.log("Database initialized successfully");
        return db;
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};

// Get database instance
export const getDatabase = async () => {
    if (!db) {
        return await initDatabase();
    }
    return db;
};

// Seed sample interaction data
export const seedInteractions = async () => {
    try {
        const database = await getDatabase();
        
        const sampleInteractions = [
            {
                drug_a: "ibuprofen",
                drug_b: "warfarin",
                severity: "major",
                description: "Ibuprofen may increase the anticoagulant effect of warfarin, increasing the risk of bleeding.",
                recommendation: "Avoid concurrent use. If necessary, monitor INR closely and adjust warfarin dosage."
            },
            {
                drug_a: "aspirin",
                drug_b: "warfarin",
                severity: "major",
                description: "Aspirin can increase the risk of bleeding when taken with warfarin.",
                recommendation: "Use with caution. Monitor for signs of bleeding. Consider lower aspirin dose."
            },
            {
                drug_a: "ibuprofen",
                drug_b: "aspirin",
                severity: "moderate",
                description: "Concurrent use may increase the risk of gastrointestinal bleeding.",
                recommendation: "Use with caution. Monitor for GI symptoms."
            },
            {
                drug_a: "paracetamol",
                drug_b: "warfarin",
                severity: "moderate",
                description: "High doses of paracetamol may enhance the anticoagulant effect of warfarin.",
                recommendation: "Monitor INR if using high doses (>2g/day) of paracetamol."
            },
            {
                drug_a: "amoxicillin",
                drug_b: "warfarin",
                severity: "moderate",
                description: "Amoxicillin may enhance the anticoagulant effect of warfarin.",
                recommendation: "Monitor INR during and after antibiotic therapy."
            },
            {
                drug_a: "metformin",
                drug_b: "ibuprofen",
                severity: "minor",
                description: "Ibuprofen may slightly increase metformin levels.",
                recommendation: "Monitor blood glucose levels."
            },
        ];

        for (const interaction of sampleInteractions) {
            try {
                await database.runAsync(
                    `INSERT OR IGNORE INTO drug_interactions 
                    (drug_a, drug_b, severity, description, recommendation) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        interaction.drug_a.toLowerCase(),
                        interaction.drug_b.toLowerCase(),
                        interaction.severity,
                        interaction.description,
                        interaction.recommendation,
                    ]
                );
            } catch (err) {
                // Ignore duplicate key errors
                if (!err.message?.includes("UNIQUE constraint")) {
                    console.error("Error seeding interaction:", err);
                }
            }
        }

        console.log("Sample interactions seeded successfully");
    } catch (error) {
        console.error("Error seeding interactions:", error);
    }
};

