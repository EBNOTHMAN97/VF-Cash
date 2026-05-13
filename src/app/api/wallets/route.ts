import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets, transactions } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

// الحصول على جميع المحافظ مع الإحصائيات
export async function GET() {
  try {
    const allWallets = await db.select().from(wallets);
    
    const walletsWithStats = await Promise.all(
      allWallets.map(async (wallet) => {
        // الحصول على بداية اليوم الحالي
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        // الحصول على بداية الشهر الحالي
        const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        
        // حساب المصروفات اليومية باستخدام SQL مباشر
        const dailySpent = await db
          .select({ 
            total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS NUMERIC)), 0)::text` 
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.walletId, wallet.id),
              eq(transactions.type, 'send'),
              sql`DATE(${transactions.transactionDate}) >= DATE(${todayStart.toISOString()})`
            )
          );
        
        // حساب المصروفات الشهرية باستخدام SQL مباشر
        const monthlySpent = await db
          .select({ 
            total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS NUMERIC)), 0)::text` 
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.walletId, wallet.id),
              eq(transactions.type, 'send'),
              sql`DATE(${transactions.transactionDate}) >= DATE(${monthStart.toISOString()})`
            )
          );
        
        const dailySpentValue = Number(dailySpent[0]?.total || '0');
        const monthlySpentValue = Number(monthlySpent[0]?.total || '0');
        
        return {
          ...wallet,
          dailySpent: dailySpentValue,
          monthlySpent: monthlySpentValue,
          dailyRemaining: Number(wallet.dailyLimit) - dailySpentValue,
          monthlyRemaining: Number(wallet.monthlyLimit) - monthlySpentValue,
        };
      })
    );
    
    return NextResponse.json(walletsWithStats);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 });
  }
}

// إضافة محفظة جديدة
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phoneNumber, dailyLimit, monthlyLimit, currentBalance, color } = body;
    
    const newWallet = await db.insert(wallets).values({
      name,
      phoneNumber,
      dailyLimit,
      monthlyLimit,
      currentBalance: currentBalance || '0',
      color: color || '#1E40AF',
    }).returning();
    
    return NextResponse.json(newWallet[0]);
  } catch (error) {
    console.error('Error creating wallet:', error);
    return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
  }
}
