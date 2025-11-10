# Quick Start Guide - Jewelry Business Manager

## 🚀 Getting Started in 5 Steps

### Step 1: Install Dependencies
```bash
cd ayza_manager
npm install
```

### Step 2: Set Up Supabase Database
1. Go to https://supabase.com and create a new project
2. Once created, go to SQL Editor
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL script
5. This creates all tables, RLS policies, triggers, and views

### Step 3: Configure Environment Variables
1. Copy the example file:
```bash
cp .env.local.example .env.local
```

2. Fill in your Supabase credentials:
   - Go to Supabase Project Settings > API
   - Copy the Project URL and anon/public key
   - Paste them into `.env.local`

3. Fill in your Twilio credentials:
   - Go to https://twilio.com/console
   - Copy Account SID, Auth Token, and your Twilio phone number
   - Paste them into `.env.local`

### Step 4: Create Your Admin User
1. In Supabase Dashboard, go to Authentication > Users
2. Click "Add user" > Create new user
3. Enter email and password
4. Copy the user's UUID (it will be shown in the users list)
5. Go to SQL Editor and run:
```sql
UPDATE profiles 
SET role = 'admin', phone_number = '+1234567890'  -- Replace with your phone
WHERE id = 'paste-user-uuid-here';
```

### Step 5: Run the Application
```bash
npm run dev
```

Visit http://localhost:3000 and log in with your admin credentials!

## 📋 What You Get

### For Admins
- **Dashboard**: Full business analytics and metrics
- **Stock Management**: Add/edit/delete products and variants
- **Sales**: Record and view all sales

### For Staff
- **Sales Only**: Record new sales and view their own transactions

## 🎯 Next Steps

1. **Add Products**: Go to Stock page and click "Add Product"
2. **Record a Sale**: Go to Sales page and click "Record New Sale"
3. **Monitor Dashboard**: View real-time metrics and low stock alerts

## 🔧 Tech Stack
- **Next.js 14+** - React framework with App Router
- **Supabase** - Database, authentication, and real-time features
- **Shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first styling
- **Twilio** - SMS notifications for low stock alerts

## 📚 Learn More
- Full documentation in `README.md`
- Database schema in `supabase/schema.sql`
- All types defined in `lib/types.ts`

## 🆘 Common Issues

**Can't log in?**
- Check your Supabase credentials in `.env.local`
- Verify the user exists in Supabase Auth
- Check browser console for errors

**SMS not sending?**
- Verify Twilio credentials
- Ensure phone numbers include country code (+1)
- Check Twilio console for delivery status

**Stock not updating?**
- Verify you're logged in as admin
- Check RLS policies in Supabase
- Look at browser console for errors

## 🎉 You're All Set!
Your jewelry business management system is ready to use. Happy selling! 💎
