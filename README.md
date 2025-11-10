# Jewelry Business Manager

A complete business management web application for jewelry stores built with Next.js 14+, Supabase, and Shadcn/ui.

## 🚀 Features

- **Role-Based Access Control (RBAC)**
  - Admin: Full access to dashboard, stock management, and sales
  - Staff: Access to sales recording only

- **Dashboard (Admin Only)**
  - Total revenue (Chiffre d'Affaire) visualization
  - Sales statistics and metrics
  - Best selling items analysis
  - Low stock alerts

- **Stock Management (Admin Only)**
  - Product and variant management
  - SKU tracking
  - Inventory levels monitoring
  - Category management (necklace, bracelet, earrings, watch, ring)

- **Sales Management**
  - Record new sales with variant selection
  - Automatic stock deduction
  - Price locking at sale time
  - Sales history with filtering

- **SMS Notifications**
  - Automatic low stock alerts via Twilio
  - Sent to admin when stock reaches threshold

- **Dark Mode**
  - System-aware theme switcher
  - Persistent user preference

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Twilio account (for SMS notifications)

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd ayza_manager
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run the SQL migration file: `supabase/schema.sql`
4. This will create all tables, RLS policies, and helper functions

### 3. Set Up Twilio

1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Get a phone number with SMS capabilities
3. Note your Account SID and Auth Token from the console

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 5. Create Your First Admin User

1. Go to Supabase Authentication > Users
2. Create a new user with email and password
3. Copy the user's UUID
4. Go to SQL Editor and run:

```sql
UPDATE profiles 
SET role = 'admin', phone_number = '+1234567890'
WHERE id = 'your-user-uuid-here';
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your admin credentials.

## 📁 Project Structure

```
ayza_manager/
├── app/
│   ├── (app)/                    # Authenticated routes with sidebar
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── stock/                # Stock management
│   │   ├── sales/                # Sales recording
│   │   └── layout.tsx            # App layout with sidebar
│   ├── actions/                  # Server actions
│   │   ├── products.ts           # Product CRUD operations
│   │   └── sales.ts              # Sales and notifications
│   ├── login/                    # Login page
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/
│   ├── dashboard/                # Dashboard components
│   ├── stock/                    # Stock management components
│   ├── sales/                    # Sales components
│   ├── ui/                       # Shadcn/ui components
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── theme-provider.tsx        # Dark mode provider
│   └── theme-toggle.tsx          # Theme switcher
├── lib/
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── auth.ts                   # Auth utilities
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utility functions
├── supabase/
│   └── schema.sql                # Database schema
├── middleware.ts                 # Route protection
└── package.json
```

## 🗄️ Database Schema

### Tables

- **profiles**: User profiles with roles
- **products**: Base product information
- **product_variants**: Product variations (SKU, price, stock)
- **sales**: Sales transactions
- **sale_items**: Junction table for sale line items

### Views

- **low_stock_items**: Products below threshold
- **best_selling_products**: Top sellers by quantity
- **sales_analytics**: Daily/monthly analytics

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Role-based policies for data access
- Middleware-based route protection
- Supabase Auth integration

## 🎨 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **SMS**: Twilio
- **Language**: TypeScript

## 📝 Usage Guide

### For Admins

1. **Dashboard**: View business metrics and analytics
2. **Stock Management**:
   - Add new products with variants
   - Edit stock quantities and thresholds
   - Monitor low stock items
3. **Sales**: Record sales and view all transactions

### For Staff

1. **Sales Only**: Access limited to recording new sales
2. Sales are automatically attributed to the logged-in staff member

## 🔄 Key Workflows

### Recording a Sale

1. Navigate to Sales page
2. Click "Record New Sale"
3. Search and select product variants
4. Enter quantity for each item
5. Review total and submit
6. Stock is automatically updated
7. Low stock alerts sent if threshold reached

### Adding New Product

1. Navigate to Stock page
2. Click "Add New Product"
3. Fill in product details and first variant
4. Submit to create
5. Add more variants as needed

## 🚨 Low Stock Alerts

The system automatically:
1. Monitors stock levels after each sale
2. Compares with low_stock_threshold
3. Sends SMS to all admin phone numbers
4. Displays alerts on dashboard

## 📱 SMS Format

```
LOW STOCK ALERT: Gold Hoop Earrings - Size 6 is low on stock. Only 3 left.
```

## 🔧 Development

### Adding New Components

```bash
# The project uses Shadcn/ui
# Add components as needed:
npx shadcn-ui@latest add [component-name]
```

### Running in Production

```bash
npm run build
npm start
```

## 📊 Database Migrations

All schema changes should be made through SQL migrations in `supabase/schema.sql`.

To apply new migrations:
1. Edit the schema file
2. Run in Supabase SQL Editor
3. Test thoroughly before deploying

## 🐛 Troubleshooting

### Authentication Issues
- Verify Supabase URL and keys in `.env.local`
- Check user has profile record created
- Ensure RLS policies are active

### SMS Not Sending
- Verify Twilio credentials
- Check phone numbers have country code (+1)
- Confirm Twilio account has SMS permissions

### Stock Not Updating
- Check RLS policies on product_variants table
- Verify user has admin role
- Check browser console for errors

## 📄 License

MIT

## 👨‍💻 Author

# Ayza Manager 💎

A complete Progressive Web App (PWA) for jewelry business management built with Next.js 14, Supabase, and modern web technologies.

## ✨ Features

- 📱 **Progressive Web App** - Install on any device (iOS, Android, Desktop)
- 📸 **Image Upload** - Upload product images directly from camera or gallery
- 📊 **Dashboard** - Real-time sales metrics and analytics
- 📦 **Inventory Management** - Track stock with low-stock alerts
- 💰 **Sales Tracking** - Record and view sales history
- 👥 **Role-Based Access** - Admin and Staff roles with different permissions
- 🌓 **Dark Mode** - Beautiful dark and light themes
- 📱 **Mobile-First** - Optimized for mobile use
- 🔄 **Offline Support** - Works offline with service worker caching

## 🤝 Contributing

This is a complete, production-ready application. Feel free to fork and customize for your specific needs.

## 📞 Support

For issues related to:
- **Supabase**: Check Supabase documentation
- **Twilio**: Check Twilio console and logs
- **Next.js**: Refer to Next.js documentation

---

Built with ❤️ using Next.js, Supabase, and Shadcn/ui
