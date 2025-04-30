import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Create a new pool using the connection string from environment variables
export const db = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Function to run migrations
export async function runMigrations() {
    try {
        const migrationsDir = path.join(process.cwd(), 'lib', 'db', 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`Running migration: ${file}`);
            await db.query(sql);
            console.log(`Completed migration: ${file}`);
        }

        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    }
}

// Run migrations when the application starts
runMigrations().catch(console.error); 