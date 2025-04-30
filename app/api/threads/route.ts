import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Giả sử bạn đã có connection đến database

export async function GET() {
    try {
        // Lấy danh sách threads từ database
        const result = await db.query(`
      SELECT thread_id, title, created_at, last_accessed_at 
      FROM user_threads 
      WHERE is_deleted = false 
      AND thread_id IS NOT NULL
      ORDER BY last_accessed_at DESC
    `);

        return NextResponse.json({ threads: result.rows });
    } catch (error) {
        console.error('Error fetching threads:', error);
        return NextResponse.json(
            { error: 'Failed to fetch threads' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { thread_id, title } = await request.json();

        if (!thread_id) {
            return NextResponse.json(
                { error: 'Thread ID is required' },
                { status: 400 }
            );
        }

        // Thêm thread mới vào database
        const result = await db.query(`
      INSERT INTO user_threads (thread_id, title, created_at, last_accessed_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING thread_id, title, created_at, last_accessed_at
    `, [thread_id, title || 'New Conversation']);

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating thread:', error);
        return NextResponse.json(
            { error: 'Failed to create thread' },
            { status: 500 }
        );
    }
} 