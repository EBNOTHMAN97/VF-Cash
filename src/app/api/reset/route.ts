import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets, transactions } from '@/db/schema';
import { sql } from 'drizzle-orm';

// حذف جميع البيانات (Reset)
export async function POST() {
  try {
    // حذف جميع المعاملات أولاً (بسبب foreign key)
    await db.delete(transactions);
    
    // حذف جميع المحافظ
    await db.delete(wallets);
    
    // إعادة تعيين auto-increment counters
    await db.execute(sql`ALTER SEQUENCE transactions_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE wallets_id_seq RESTART WITH 1`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم حذف جميع البيانات بنجاح' 
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
  }
}
