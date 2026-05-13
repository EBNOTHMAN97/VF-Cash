# 📱 Vodafone Cash Wallet Tracker

A comprehensive web application for tracking and managing Vodafone Cash wallets with daily and monthly limits monitoring.

🇪🇬 **[النسخة العربية - Arabic Documentation](./README_AR.md)**

## 🌟 Features

- 💰 **Multi-Wallet Management** - Track unlimited Vodafone Cash wallets
- 📊 **Daily Limit Tracking** - Monitor daily spending against limits
- 📈 **Monthly Limit Tracking** - Monitor monthly spending against limits  
- 💵 **Balance Tracking** - Real-time balance for each wallet
- 🎨 **Custom Colors** - Assign unique colors to each wallet
- 📝 **Transaction History** - Complete log of all sends and receives
- ⚡ **Real-time Updates** - Instant statistics updates after transactions
- 🌐 **Arabic Interface** - Full RTL support with Arabic UI
- 🎯 **Visual Indicators** - Color-coded warnings (green, yellow, red)
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop

## 🚀 Quick Start

### 1. First Launch
When you first open the app, you'll see:
- **+ Add New Wallet** - Manually add a wallet
- **🎲 Sample Data** - Add 6 sample wallets for testing

### 2. Add Your Wallets
Click "Add New Wallet" and enter:
- Wallet name
- Phone number
- Daily limit (in EGP)
- Monthly limit (in EGP)
- Current balance
- Distinctive color

### 3. Track Transactions
When sending or receiving money:
1. Click **+ Add Transaction**
2. Select wallet
3. Choose type:
   - **Send (Debit)** - When paying out
   - **Receive (Credit)** - When receiving money
4. Enter amount and description
5. Click "Add"

## 📊 Understanding the Interface

### Wallet Cards
Each wallet displays:
- 💵 **Current Balance**
- 📅 **Daily Limit** with progress bar
- 📆 **Monthly Limit** with progress bar

### Color Indicators
- 🟢 **Green (0-70%)**: Safe zone
- 🟡 **Yellow (70-90%)**: Warning - approaching limit
- 🔴 **Red (90-100%)**: Danger - at or exceeding limit

### Transaction Types
- 📤 **Send**: Decreases balance, counts toward limits
- 📥 **Receive**: Increases balance, doesn't affect limits

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database queries
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 📦 API Routes

- `GET /api/wallets` - Get all wallets with statistics
- `POST /api/wallets` - Create a new wallet
- `GET /api/transactions` - Get transactions (optional walletId filter)
- `POST /api/transactions` - Create a new transaction
- `POST /api/seed` - Seed sample wallets (dev only)

## 🗃️ Database Schema

### Wallets Table
```sql
- id (serial, primary key)
- name (text)
- phone_number (text, unique)
- daily_limit (numeric)
- monthly_limit (numeric)
- current_balance (numeric)
- color (text)
- created_at (timestamp)
```

### Transactions Table
```sql
- id (serial, primary key)
- wallet_id (integer, foreign key)
- type (text: 'send' or 'receive')
- amount (numeric)
- description (text)
- transaction_date (timestamp)
- created_at (timestamp)
```

## 💡 Use Cases

### Case 1: Shop Owner
Track separate wallets for:
- Sales (receive from customers)
- Purchases (pay suppliers)
- Personal expenses

### Case 2: Freelancer
Manage:
- Income wallet
- Expenses wallet
- Savings wallet

### Case 3: Small Business
One wallet per department:
- Sales, Purchases, HR, Marketing, Maintenance, Admin

## 🔐 Security

- Secure PostgreSQL database
- No credit card or PIN storage
- Local data storage on server
- No third-party data sharing

## 📝 Notes

- **Daily limits** reset at 00:00 each day
- **Monthly limits** reset on the 1st of each month
- Only **"send"** transactions count toward limits
- **Balance** is affected by both send and receive

## 🎯 Typical Vodafone Cash Limits

Reference values (actual limits may vary):

**Regular Wallet:**
- Daily: 3,000 - 6,000 EGP
- Monthly: 30,000 - 60,000 EGP

**Plus Wallet:**
- Daily: 10,000 - 20,000 EGP
- Monthly: 100,000 - 200,000 EGP

## 📚 Documentation

- [Arabic User Guide](./USAGE_GUIDE_AR.md) - Detailed usage guide in Arabic
- [Features Guide](./FEATURES_AR.md) - Comprehensive features documentation in Arabic

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

Built for the Egyptian developer community and Vodafone Cash users.

---

Made with ❤️ for 🇪🇬 Egypt
