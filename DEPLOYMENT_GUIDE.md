# Deploy to Vercel - Complete Guide

## Prerequisites

1. **GitHub Account** - To host your code repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Supabase Project** - Already set up at https://decetvafdojweavvdnop.supabase.co

## Step 1: Prepare Your Project

### 1.1 Run the Database Migration

Before deploying, you MUST run the migration in Supabase:

1. Go to https://supabase.com/dashboard/project/decetvafdojweavvdnop
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste the contents of `supabase/add_images_migration.sql`
5. Click **Run**

This creates:
- ✅ `image_url` column in products table
- ✅ Storage bucket for product images
- ✅ Storage policies for uploads

### 1.2 Initialize Git Repository (if not already done)

```bash
cd /Users/am1ne/Desktop/ayza_manager
git init
git add .
git commit -m "Initial commit - Ayza Manager PWA"
```

### 1.3 Create GitHub Repository

1. Go to [github.com](https://github.com/new)
2. Create a new repository named `ayza-manager`
3. Don't add README, .gitignore, or license (already exists)
4. Click **Create repository**

### 1.4 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/ayza-manager.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `ayza-manager` repository
4. Click **Import**

### 2.2 Configure Project

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build` (leave default)
- **Output Directory**: `.next` (leave default)
- **Install Command**: `npm install` (leave default)

### 2.3 Add Environment Variables

Click **Add** under Environment Variables and add these:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://decetvafdojweavvdnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY2V0dmFmZG9qd2VhdnZkbm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDQ5NDEsImV4cCI6MjA3ODM4MDk0MX0.49r3wwE7aU3OH6GIK2PyUNuH8v4KwKZd15Pohom0Dwg
```

**Optional (for SMS alerts):**
```
TWILIO_ACCOUNT_SID=your_actual_account_sid
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

> **Note**: Leave Twilio variables empty if you don't want SMS alerts. The app works fine without them!

### 2.4 Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://ayza-manager.vercel.app`

## Step 3: Configure Supabase for Production

### 3.1 Add Vercel Domain to Supabase

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to **Site URL**: `https://ayza-manager.vercel.app`
3. Add to **Redirect URLs**:
   ```
   https://ayza-manager.vercel.app/**
   https://ayza-manager.vercel.app/auth/callback
   ```

### 3.2 Update Storage CORS (if needed)

If images don't load, update storage CORS:

1. Go to Storage → Configuration → CORS
2. Add allowed origin: `https://ayza-manager.vercel.app`

## Step 4: Install as PWA

### On iPhone/iPad:

1. Open Safari and go to your Vercel URL
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**
5. App icon appears on home screen! 🎉

### On Android:

1. Open Chrome and go to your Vercel URL
2. Tap the **three dots** menu (⋮)
3. Tap **Add to Home Screen** or **Install App**
4. Tap **Add** or **Install**
5. App appears in app drawer! 🎉

### On Desktop:

1. Open Chrome/Edge and go to your Vercel URL
2. Look for **Install** button in address bar
3. Click **Install**
4. App opens as standalone window! 🎉

## Step 5: Verify Everything Works

Test these features:

- ✅ Login with your admin account
- ✅ View Dashboard (stats, charts)
- ✅ Add product with image upload
- ✅ View stock with images
- ✅ Record a sale
- ✅ Check sales history
- ✅ Upload image from phone camera (PWA)

## Features Enabled in Production

### PWA Features:
- ✅ **Installable** - Add to home screen on any device
- ✅ **Offline-capable** - Service worker caches assets
- ✅ **Fast loading** - Cached images and API responses
- ✅ **Mobile-optimized** - Works like native app
- ✅ **Camera access** - Upload photos directly from phone
- ✅ **App shortcuts** - Quick access to Sales & Stock

### Caching Strategy:
- **Images**: Cache-first (30 days)
- **Supabase API**: Network-first (24 hours)
- **Static assets**: Automatic caching

## Troubleshooting

### Build Fails

**Issue**: Lint errors or TypeScript errors

**Solution**: 
```bash
npm run build
```
Fix any errors locally first, then push again.

### Environment Variables Not Working

**Issue**: App can't connect to Supabase

**Solution**: 
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all variables are added correctly
3. Redeploy: Vercel Dashboard → Deployments → ⋯ → Redeploy

### Images Not Loading

**Issue**: Product images show "No img"

**Solution**:
1. Run the migration in Supabase (Step 1.1)
2. Check Storage CORS settings (Step 3.2)
3. Verify storage bucket exists: Supabase → Storage → product-images

### PWA Not Installing

**Issue**: "Add to Home Screen" doesn't appear

**Solution**:
1. Make sure you're using HTTPS (Vercel provides this)
2. Open in correct browser (Safari on iOS, Chrome on Android)
3. Check manifest.json loads: `https://your-url.vercel.app/manifest.json`

### SMS Alerts Not Working

**Issue**: Low stock alerts not sending

**Solution**: This is optional! Either:
1. Add proper Twilio credentials in Vercel environment variables
2. Or leave it disabled - app works fine without SMS

## Continuous Deployment

Once set up, any push to your GitHub repository will automatically:
1. Trigger a new Vercel build
2. Run tests
3. Deploy to production
4. Update your PWA

Just push changes:
```bash
git add .
git commit -m "Update features"
git push
```

Vercel handles the rest! 🚀

## Custom Domain (Optional)

Want your own domain like `ayza.app`?

1. Buy domain from any registrar
2. Vercel Dashboard → Settings → Domains
3. Add your domain
4. Update DNS records (Vercel provides instructions)
5. Update Supabase redirect URLs with new domain

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **PWA Docs**: https://web.dev/progressive-web-apps/

---

## Summary

You now have:
- ✅ Production app on Vercel
- ✅ PWA installable on all devices
- ✅ Image uploads to Supabase Storage
- ✅ Automatic deployments from GitHub
- ✅ HTTPS and custom domain support
- ✅ Mobile-optimized experience

**Your app is live and ready for business!** 💎📱
