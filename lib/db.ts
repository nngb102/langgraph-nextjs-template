import { Pool } from 'pg'

// Tạo pool connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

// Helper function để thực thi queries
export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),
} 