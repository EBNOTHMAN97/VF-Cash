import { NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions, wallets } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

// الحصول على جميع المعاملات
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');
    
    let allTransactions;
    
    if (walletId) {
      allTransactions = await db.select().from(transactions)
        .where(eq(transactions.walletId, parseInt(walletId)))
        .orderBy(desc(transactions.transactionDate))
        .limit(100);
    } else {
      allTransactions = await db.select().from(transactions)
        .orderBy(desc(transactions.transactionDate))
        .limit(100);
    }
    
    return NextResponse.json(allTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// إضافة معاملة جديدة
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletId, type, amount, description } = body;
    
    // إضافة المعاملة
    const newTransaction = await db.insert(transactions).values({
      walletId,
      type,
      amount,
      description,
    }).returning();
    
    // تحديث رصيد المحفظة
    const wallet = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
    
    if (wallet.length > 0) {
      const currentBalance = Number(wallet[0].currentBalance || 0);
      const transactionAmount = Number(amount);
      const newBalance = type === 'receive' 
        ? currentBalance + transactionAmount 
        : currentBalance - transactionAmount;
      
      await db.update(wallets)
        .set({ currentBalance: newBalance.toString() })
        .where(eq(wallets.id, walletId));
    }
    
    return NextResponse.json(newTransaction[0]);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

// تعديل معاملة
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, walletId, type, amount, description } = body;
    
    // الحصول على المعاملة القديمة
    const oldTransaction = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    
    if (oldTransaction.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    const oldWalletId = oldTransaction[0].walletId;
    const oldType = oldTransaction[0].type;
    const oldAmount = Number(oldTransaction[0].amount);
    
    // الحصول على المحفظة القديمة
    const oldWallet = await db.select().from(wallets).where(eq(wallets.id, oldWalletId)).limit(1);
    
    if (oldWallet.length > 0) {
      // إلغاء تأثير المعاملة القديمة
      let oldBalance = Number(oldWallet[0].currentBalance || 0);
      if (oldType === 'receive') {
        oldBalance -= oldAmount;
      } else {
        oldBalance += oldAmount;
      }
      
      await db.update(wallets)
        .set({ currentBalance: oldBalance.toString() })
        .where(eq(wallets.id, oldWalletId));
    }
    
    // تحديث المعاملة
    const updatedTransaction = await db.update(transactions)
      .set({
        walletId,
        type,
        amount,
        description,
      })
      .where(eq(transactions.id, id))
      .returning();
    
    // تطبيق تأثير المعاملة الجديدة
    const newWallet = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
    
    if (newWallet.length > 0) {
      const currentBalance = Number(newWallet[0].currentBalance || 0);
      const transactionAmount = Number(amount);
      const newBalance = type === 'receive' 
        ? currentBalance + transactionAmount 
        : currentBalance - transactionAmount;
      
      await db.update(wallets)
        .set({ currentBalance: newBalance.toString() })
        .where(eq(wallets.id, walletId));
    }
    
    return NextResponse.json(updatedTransaction[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

// حذف معاملة
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }
    
    // الحصول على المعاملة قبل الحذف
    const transaction = await db.select().from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);
    
    if (transaction.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    const { walletId, type, amount } = transaction[0];
    
    // حذف المعاملة
    await db.delete(transactions).where(eq(transactions.id, parseInt(id)));
    
    // تحديث رصيد المحفظة (عكس تأثير المعاملة)
    const wallet = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
    
    if (wallet.length > 0) {
      const currentBalance = Number(wallet[0].currentBalance || 0);
      const transactionAmount = Number(amount);
      const newBalance = type === 'receive' 
        ? currentBalance - transactionAmount 
        : currentBalance + transactionAmount;
      
      await db.update(wallets)
        .set({ currentBalance: newBalance.toString() })
        .where(eq(wallets.id, walletId));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
