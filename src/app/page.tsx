'use client';

import { useState, useEffect } from 'react';

type WalletWithStats = {
  id: number;
  name: string;
  phoneNumber: string;
  dailyLimit: string;
  monthlyLimit: string;
  currentBalance: string;
  color: string;
  dailySpent: number;
  monthlySpent: number;
  dailyRemaining: number;
  monthlyRemaining: number;
};

type Transaction = {
  id: number;
  walletId: number;
  type: string;
  amount: string;
  description: string;
  transactionDate: string;
};

export default function Home() {
  const [wallets, setWallets] = useState<WalletWithStats[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditTransaction, setShowEditTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchWallets = async () => {
    const res = await fetch('/api/wallets');
    const data = await res.json();
    setWallets(data);
    setLoading(false);
  };

  const fetchTransactions = async (walletId?: number) => {
    const url = walletId ? `/api/transactions?walletId=${walletId}` : '/api/transactions';
    const res = await fetch(url);
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, []);

  const handleAddWallet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newWallet = {
      name: formData.get('name'),
      phoneNumber: formData.get('phoneNumber'),
      dailyLimit: formData.get('dailyLimit'),
      monthlyLimit: formData.get('monthlyLimit'),
      currentBalance: formData.get('currentBalance') || '0',
      color: formData.get('color'),
    };

    await fetch('/api/wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWallet),
    });

    setShowAddWallet(false);
    fetchWallets();
    e.currentTarget.reset();
  };

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTransaction = {
      walletId: parseInt(formData.get('walletId') as string),
      type: formData.get('type'),
      amount: formData.get('amount'),
      description: formData.get('description'),
    };

    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction),
    });

    setShowAddTransaction(false);
    fetchWallets();
    fetchTransactions(selectedWallet || undefined);
    e.currentTarget.reset();
  };

  const getPercentage = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSeedData = async () => {
    if (wallets.length > 0 && !confirm('هل تريد إضافة بيانات تجريبية؟ (سيتم إضافة 6 محافظ جديدة)')) {
      return;
    }
    
    setSeeding(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      await fetchWallets();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
    setSeeding(false);
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      return;
    }
    
    try {
      await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      await fetchWallets();
      await fetchTransactions(selectedWallet || undefined);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditTransaction(true);
  };

  const handleUpdateTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!editingTransaction) return;
    
    const updatedTransaction = {
      id: editingTransaction.id,
      walletId: parseInt(formData.get('walletId') as string),
      type: formData.get('type'),
      amount: formData.get('amount'),
      description: formData.get('description'),
    };

    await fetch('/api/transactions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTransaction),
    });

    setShowEditTransaction(false);
    setEditingTransaction(null);
    fetchWallets();
    fetchTransactions(selectedWallet || undefined);
    e.currentTarget.reset();
  };

  const handleResetAllData = async () => {
    if (!confirm('⚠️ تحذير: هل أنت متأكد من حذف جميع البيانات؟\nهذا الإجراء لا يمكن التراجع عنه!')) {
      return;
    }
    
    if (!confirm('⚠️ تأكيد نهائي: سيتم حذف جميع المحافظ والمعاملات نهائياً!')) {
      return;
    }
    
    try {
      await fetch('/api/reset', { method: 'POST' });
      setWallets([]);
      setTransactions([]);
      setSelectedWallet(null);
      alert('✅ تم حذف جميع البيانات بنجاح');
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('❌ حدث خطأ أثناء حذف البيانات');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-2xl text-red-600 font-bold">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                📱 متابعة محافظ فودافون كاش
              </h1>
              <p className="text-gray-600">نظام متابعة الحدود اليومية والشهرية</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowAddWallet(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
              >
                + إضافة محفظة جديدة
              </button>
              {wallets.length === 0 && (
                <button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
                >
                  {seeding ? '⏳ جاري الإضافة...' : '🎲 بيانات تجريبية'}
                </button>
              )}
              {(wallets.length > 0 || transactions.length > 0) && (
                <button
                  onClick={handleResetAllData}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
                >
                  🗑️ حذف جميع البيانات
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => {
            const dailyPercentage = getPercentage(wallet.dailySpent, Number(wallet.dailyLimit));
            const monthlyPercentage = getPercentage(wallet.monthlySpent, Number(wallet.monthlyLimit));

            return (
              <div
                key={wallet.id}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all cursor-pointer"
                style={{ borderTop: `4px solid ${wallet.color}` }}
                onClick={() => {
                  setSelectedWallet(wallet.id);
                  fetchTransactions(wallet.id);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{wallet.name}</h3>
                    <p className="text-gray-500 text-sm">{wallet.phoneNumber}</p>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-700">الرصيد الحالي</span>
                    <span className="text-lg font-bold text-green-600">
                      {Number(wallet.currentBalance).toFixed(2)} ج.م
                    </span>
                  </div>
                </div>

                {/* Daily Limit */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">الحد اليومي</span>
                    <span className="text-sm text-gray-600">
                      {wallet.dailyRemaining.toFixed(2)} / {Number(wallet.dailyLimit).toFixed(2)} ج.م
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(dailyPercentage)}`}
                      style={{ width: `${dailyPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    مستخدم: {dailyPercentage.toFixed(1)}%
                  </p>
                </div>

                {/* Monthly Limit */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">الحد الشهري</span>
                    <span className="text-sm text-gray-600">
                      {wallet.monthlyRemaining.toFixed(2)} / {Number(wallet.monthlyLimit).toFixed(2)} ج.م
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(monthlyPercentage)}`}
                      style={{ width: `${monthlyPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    مستخدم: {monthlyPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedWallet ? `معاملات ${wallets.find(w => w.id === selectedWallet)?.name}` : 'آخر المعاملات'}
            </h2>
            <div className="flex gap-3">
              {selectedWallet && (
                <button
                  onClick={() => {
                    setSelectedWallet(null);
                    fetchTransactions();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                >
                  عرض الكل
                </button>
              )}
              <button
                onClick={() => setShowAddTransaction(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
              >
                + إضافة معاملة
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">المحفظة</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">النوع</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">المبلغ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">الوصف</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">التاريخ</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const wallet = wallets.find(w => w.id === transaction.walletId);
                  return (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{wallet?.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.type === 'send'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {transaction.type === 'send' ? '📤 إرسال' : '📥 استلام'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {Number(transaction.amount).toFixed(2)} ج.م
                      </td>
                      <td className="py-3 px-4 text-gray-600">{transaction.description || '-'}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(transaction.transactionDate).toLocaleString('ar-EG')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold transition-all"
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition-all"
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">لا توجد معاملات بعد</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Wallet Modal */}
      {showAddWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">إضافة محفظة جديدة</h3>
            <form onSubmit={handleAddWallet}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">اسم المحفظة</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="مثال: محفظة رقم 1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
                <input
                  type="text"
                  name="phoneNumber"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="01xxxxxxxxx"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">الحد اليومي (ج.م)</label>
                <input
                  type="number"
                  name="dailyLimit"
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="5000"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">الحد الشهري (ج.م)</label>
                <input
                  type="number"
                  name="monthlyLimit"
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="50000"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">الرصيد الحالي (ج.م)</label>
                <input
                  type="number"
                  name="currentBalance"
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="0"
                  defaultValue="0"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">اللون</label>
                <input
                  type="color"
                  name="color"
                  defaultValue="#1E40AF"
                  className="w-full h-12 px-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-all"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWallet(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditTransaction && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">تعديل المعاملة</h3>
            <form onSubmit={handleUpdateTransaction}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">المحفظة</label>
                <select
                  name="walletId"
                  required
                  defaultValue={editingTransaction.walletId}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - {wallet.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">نوع المعاملة</label>
                <select
                  name="type"
                  required
                  defaultValue={editingTransaction.type}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                >
                  <option value="send">إرسال (خصم)</option>
                  <option value="receive">استلام (إضافة)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">المبلغ (ج.م)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  step="0.01"
                  defaultValue={editingTransaction.amount}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">الوصف (اختياري)</label>
                <input
                  type="text"
                  name="description"
                  defaultValue={editingTransaction.description || ''}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all"
                >
                  💾 حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTransaction(false);
                    setEditingTransaction(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">إضافة معاملة جديدة</h3>
            <form onSubmit={handleAddTransaction}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">المحفظة</label>
                <select
                  name="walletId"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                >
                  <option value="">اختر المحفظة</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - {wallet.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">نوع المعاملة</label>
                <select
                  name="type"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                >
                  <option value="send">إرسال (خصم)</option>
                  <option value="receive">استلام (إضافة)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">المبلغ (ج.م)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="100"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">الوصف (اختياري)</label>
                <input
                  type="text"
                  name="description"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="وصف المعاملة"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
