import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets } from '@/db/schema';

// API لإضافة بيانات تجريبية (6 محافظ)
export async function POST() {
  try {
    const sampleWallets = [
      {
        name: 'محفظة رقم 1',
        phoneNumber: '01012345678',
        dailyLimit: '5000',
        monthlyLimit: '50000',
        currentBalance: '2500',
        color: '#DC2626',
      },
      {
        name: 'محفظة رقم 2',
        phoneNumber: '01123456789',
        dailyLimit: '7000',
        monthlyLimit: '70000',
        currentBalance: '3200',
        color: '#EA580C',
      },
      {
        name: 'محفظة رقم 3',
        phoneNumber: '01234567890',
        dailyLimit: '6000',
        monthlyLimit: '60000',
        currentBalance: '4100',
        color: '#CA8A04',
      },
      {
        name: 'محفظة رقم 4',
        phoneNumber: '01098765432',
        dailyLimit: '8000',
        monthlyLimit: '80000',
        currentBalance: '5500',
        color: '#16A34A',
      },
      {
        name: 'محفظة رقم 5',
        phoneNumber: '01187654321',
        dailyLimit: '10000',
        monthlyLimit: '100000',
        currentBalance: '7800',
        color: '#2563EB',
      },
      {
        name: 'محفظة رقم 6',
        phoneNumber: '01276543210',
        dailyLimit: '4000',
        monthlyLimit: '40000',
        currentBalance: '1900',
        color: '#7C3AED',
      },
    ];

    await db.insert(wallets).values(sampleWallets);

    return NextResponse.json({ message: 'تم إضافة البيانات التجريبية بنجاح' });
  } catch (error) {
    console.error('Error seeding wallets:', error);
    return NextResponse.json({ error: 'Failed to seed wallets' }, { status: 500 });
  }
}
