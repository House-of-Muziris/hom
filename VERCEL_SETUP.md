# Vercel Deployment Setup Guide

## Issue: "Firebase configuration is missing" in Production

This error occurs because environment variables aren't configured in Vercel. Here's how to fix it:

---

## 🚀 Step-by-Step Vercel Setup

### 1. Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Scroll down to **"Your apps"** section
5. Find your web app or click **"Add app"** → **Web** if you haven't created one
6. Copy the `firebaseConfig` object values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← Copy this
  authDomain: "yourproject.firebaseapp.com",
  projectId: "yourproject",
  storageBucket: "yourproject.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

### 2. Add Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below (click **"Add New"** for each):

#### Required Firebase Variables (with `NEXT_PUBLIC_` prefix):

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your `apiKey` from Firebase | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your `authDomain` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your `projectId` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your `storageBucket` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your `messagingSenderId` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your `appId` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Your `measurementId` | Production, Preview, Development |

#### Required Site Configuration:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Your production domain (e.g., `https://houseofmuziris.com`) | Production |
| `NEXT_PUBLIC_SITE_URL` | Your preview URL (or keep production) | Preview |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Development |

#### Required Admin Configuration:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_ADMIN_EMAILS` | Comma-separated admin emails (e.g., `admin@example.com,admin2@example.com`) | Production, Preview, Development |

#### Required Email Service (Server-side):

| Key | Value | Environment |
|-----|-------|-------------|
| `RESEND_API_KEY` | Your Resend API key | Production, Preview |
| `RESEND_FROM_EMAIL` | Your verified sender email | Production, Preview |

### 3. **IMPORTANT:** Redeploy After Adding Variables

After adding all environment variables:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on your latest deployment
3. Select **"Redeploy"**
4. Check **"Use existing Build Cache"** (optional)
5. Click **"Redeploy"**

**OR** simply push a new commit to trigger automatic redeployment.

---

## ⚠️ Common Mistakes to Avoid

### 1. Missing `NEXT_PUBLIC_` Prefix
❌ **Wrong:** `FIREBASE_API_KEY=...`  
✅ **Correct:** `NEXT_PUBLIC_FIREBASE_API_KEY=...`

**Why:** Next.js only exposes environment variables prefixed with `NEXT_PUBLIC_` to the browser/client-side code. Firebase needs these on the client.

### 2. Not Redeploying After Adding Variables
Environment variables are only applied during build time. You **must redeploy** after adding them.

### 3. Forgetting to Select All Environments
Make sure to check all three: **Production**, **Preview**, and **Development** when adding variables (unless you want different values per environment).

### 4. Using Server-Only Variables for Firebase Config
The Resend API key should **NOT** have `NEXT_PUBLIC_` prefix (it's server-only).  
Firebase config **MUST** have `NEXT_PUBLIC_` prefix (client-side).

---

## 🧪 Testing Your Setup

After redeployment:

1. **Visit your production site**
2. **Open browser console** (F12)
3. **Try to apply for membership** (fill out waitlist form)
4. **Check for errors** in console

If successful, you should see:
- No Firebase configuration errors
- Form submission works
- Request saved to Firestore

---

## 🔍 Troubleshooting

### Still seeing "Firebase configuration is missing"?

1. **Check Variable Names:**
   - Must be **exact** (case-sensitive)
   - Must have `NEXT_PUBLIC_` prefix
   
2. **Verify in Vercel:**
   - Go to Settings → Environment Variables
   - Make sure all Firebase variables are listed
   - Check they're enabled for Production environment

3. **Check Build Logs:**
   - Go to Deployments
   - Click your latest deployment
   - Check "Building" logs for any environment variable errors

4. **Hard Refresh:**
   - Clear browser cache
   - Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or try in incognito/private window

5. **Re-add Variables:**
   - Sometimes Vercel has sync issues
   - Delete the variables and add them again
   - Redeploy

### Firebase Authentication Domain Error?

If you see CORS or redirect errors:

1. **Add your Vercel domain to Firebase:**
   - Go to Firebase Console → Authentication → Settings
   - Scroll to **"Authorized domains"**
   - Add your Vercel domain (e.g., `yourapp.vercel.app` or your custom domain)
   - Click **Save**

---

## 📋 Quick Checklist

Before deploying to Vercel, ensure:

- [ ] All Firebase config variables added with `NEXT_PUBLIC_` prefix
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain
- [ ] `NEXT_PUBLIC_ADMIN_EMAILS` configured
- [ ] `RESEND_API_KEY` added (without NEXT_PUBLIC_ prefix)
- [ ] `RESEND_FROM_EMAIL` configured
- [ ] All variables applied to Production environment
- [ ] Vercel domain added to Firebase authorized domains
- [ ] Redeployed after adding variables
- [ ] Tested in production

---

## 🎯 Environment Variables Summary

### Client-Side (NEXT_PUBLIC_ prefix) - Exposed to Browser:
- Firebase configuration (all 7 variables)
- Site URL
- Admin emails list

### Server-Side (NO prefix) - Hidden from Browser:
- Resend API key
- Resend from email

This separation ensures sensitive API keys (like Resend) are never exposed to the browser while making Firebase config available for client-side auth.

---

## 📞 Still Having Issues?

If you're still experiencing problems:

1. Check the [Vercel Environment Variables docs](https://vercel.com/docs/environment-variables)
2. Check the [Firebase Web Setup docs](https://firebase.google.com/docs/web/setup)
3. Look at deployment logs in Vercel for specific errors
4. Ensure your local `.env.local` has all the same variables (for testing locally)

**Note:** Your `.env.local` file should never be committed to Git. It's already in `.gitignore`.
