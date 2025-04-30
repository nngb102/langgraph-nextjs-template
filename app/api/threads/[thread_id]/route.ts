import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: { thread_id: string } }
) {
    try {
        const { thread_id } = params;

        // Soft delete thread
        await db.query(`
      UPDATE user_threads 
      SET is_deleted = true 
      WHERE thread_id = $1
    `, [thread_id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting thread:', error);
        return NextResponse.json(
            { error: 'Failed to delete thread' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { thread_id: string } }
) {
    try {
        const { thread_id } = await params;

        // Update last_accessed_at when thread is accessed
        await db.query(`
      UPDATE user_threads 
      SET last_accessed_at = NOW() 
      WHERE thread_id = $1
    `, [thread_id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating thread access:', error);
        return NextResponse.json(
            { error: 'Failed to update thread access' },
            { status: 500 }
        );
    }
} 
