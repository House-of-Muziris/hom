# Security Architecture - House of Muziris

## 🔒 Security Overview

This document outlines the security architecture for House of Muziris, ensuring all sensitive operations are server-side and properly authenticated.

## Client-Side vs Server-Side

### ✅ Client-Side (Safe)
- **Firebase Auth SDK**: Used for authentication (passwordless email links)
- **UI Components**: All React components
- **Public Data**: Museum info, public exhibits
- **Analytics**: Google Analytics tracking (GA4)

### 🔐 Server-Side Only (Protected)
- **Environment Variables**: All API keys (RESEND_API_KEY, Firebase credentials)
- **Database Operations**: Firestore read/write operations
- **Email Sending**: Resend API calls
- **Admin Authorization**: Email validation against whitelist
- **Member Data**: Approval/rejection operations

## Server Actions

All sensitive operations use Next.js Server Actions:

### `app/actions/admin.ts`
```typescript
'use server';

- approveRequest(requestId, requestData, adminEmail)
- rejectRequest(requestId, requestData, adminEmail, reason?)
- loadPendingRequests(adminEmail)
- loadApprovedMembers(adminEmail)
```

**Authorization**: Each function validates `adminEmail` against `NEXT_PUBLIC_ADMIN_EMAILS` environment variable before executing.

## Firebase Security Rules

### Firestore Rules (`firestore.rules`)

**Admin Emails**: Hardcoded in rules for maximum security
```javascript
function isAdmin() {
  return request.auth.token.email in [
    'frankmathewsajan@gmail.com',
    'aayushspillai@gmail.com',
    'houseofmuziris@gmail.com'
  ];
}
```

**Collection Access**:

1. **membershipRequests**
   - `create`: Anyone (public applications)
   - `read/update/delete`: Admins only

2. **approvedMembers**
   - `read`: Admins or the member themselves
   - `write`: Admins only

3. **carts**
   - `read/write`: User's own cart only (userId match)

4. **spices**
   - `read`: Public
   - `write`: Admins only

5. **Default**: Deny all other collections

## Environment Variables

### Required Variables (`.env.local`)
```bash
# Firebase Configuration (NEXT_PUBLIC_ prefix for client access)
NEXT_PUBLIC_FIREBASE_API_KEY=***
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=***
NEXT_PUBLIC_FIREBASE_PROJECT_ID=***
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=***
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=***
NEXT_PUBLIC_FIREBASE_APP_ID=***
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=***

# Resend Email Service (Server-only)
RESEND_API_KEY=re_***
RESEND_FROM_EMAIL=noreply@houseofmuziris.com

# Admin Access Control (Client-accessible for UI validation)
NEXT_PUBLIC_ADMIN_EMAILS=frankmathewsajan@gmail.com,aayushspillai@gmail.com,houseofmuziris@gmail.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://houseofmuziris.com
```

### Security Notes:
- **RESEND_API_KEY**: No `NEXT_PUBLIC_` prefix = server-only
- **Firebase keys**: Have `NEXT_PUBLIC_` prefix (safe for client, restricted by Firebase rules)
- **Admin emails**: Have `NEXT_PUBLIC_` prefix for UI validation, but server validates again

## Authentication Flow

### Admin Login
1. User enters email on `/admin`
2. Client validates email against `NEXT_PUBLIC_ADMIN_EMAILS`
3. Firebase sends passwordless link to email
4. User clicks link, Firebase Auth authenticates
5. Client calls `checkAuth()` → validates email again
6. If not admin → auto sign-out

### Member Login
1. User enters email on `/member/login`
2. Client checks if email exists in `approvedMembers` (Firestore query)
3. Firebase sends passwordless link
4. User authenticates via Firebase
5. Dashboard validates membership status
6. If not approved → auto sign-out

## Email Security

### Resend Integration
- **API Key**: Server-only environment variable
- **From Email**: `noreply@houseofmuziris.com` (verified domain)
- **SPF/DKIM/DMARC**: Configured via Resend dashboard
- **Templates**: Museum-themed HTML templates in `lib/resend-emails.ts`

### Email Types
1. **Welcome Email**: Sent on membership application
2. **Approval Email**: Sent when admin approves (includes member portal link)
3. **Rejection Email**: Sent when admin rejects (optional reason)
4. **Auth Links**: Firebase default (may go to spam until custom SMTP configured)

## Data Flow

### Membership Application
```
Client (waitlist.tsx) 
  → submitMembershipRequest() [lib/db.ts]
  → Firestore write (allowed by rules: anyone can create)
  → sendWelcomeEmail() [lib/resend-emails.ts - server-side]
  → Resend API call (server-only)
```

### Membership Approval
```
Admin clicks "Approve"
  → handleApprove() [app/admin/page.tsx - client]
  → approveRequest() [app/actions/admin.ts - server action]
  → Validates admin email
  → approveMembershipRequest() [lib/db.ts]
  → Firestore write (allowed by rules: isAdmin())
  → sendMembershipApprovalEmail() [lib/resend-emails.ts]
  → Resend API call
```

## Security Checklist

- ✅ All API keys in `.env.local` (gitignored)
- ✅ Firestore rules deployed and validated
- ✅ Admin emails hardcoded in both rules and code
- ✅ Server actions for all sensitive operations
- ✅ Email validation at multiple layers
- ✅ Auto sign-out for unauthorized access
- ✅ Member data only accessible to admin or member themselves
- ✅ Cart data isolated per user
- ✅ Passwordless auth only (no password storage)
- ✅ Custom domain email (Resend) for deliverability

## Deployment Security

### Before Production:
1. ✅ Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. ✅ Verify `.env.local` is in `.gitignore`
3. ✅ Set environment variables in hosting provider (Vercel/Netlify)
4. ✅ Test admin access with all three authorized emails
5. ✅ Test unauthorized email rejection
6. ✅ Verify member can only see their own data
7. ✅ Check email deliverability (inbox not spam)

### Regular Maintenance:
- Review Firestore security rules quarterly
- Rotate API keys annually
- Monitor Firebase Auth logs for suspicious activity
- Review admin access list when team changes
- Keep Next.js and dependencies updated

## Emergency Procedures

### If API Key Compromised:
1. Immediately revoke key in Resend dashboard
2. Generate new key
3. Update `.env.local` and hosting environment
4. Restart application

### If Unauthorized Admin Access:
1. Remove email from `NEXT_PUBLIC_ADMIN_EMAILS`
2. Update `firestore.rules` to remove email
3. Deploy: `firebase deploy --only firestore:rules`
4. Force sign-out all sessions (Firebase Console → Authentication)

### If Data Breach Detected:
1. Notify all affected members via Resend
2. Review Firestore audit logs
3. Strengthen security rules
4. Consider enabling MFA for admin accounts

## Contact
For security concerns: houseofmuziris@gmail.com
