# User & Admin Setup Guide

## Firebase Email Quota Issue - SOLVED ✅

**Problem:** Firebase has daily limits on email sign-in links (passwordless authentication), which can cause "quota-exceeded" errors.

**Solution:** ALL users (both members and admins) now use **password-based authentication** instead of email links, **completely eliminating** Firebase's email quota issues.

## Setting Up User Accounts

### For Members (Fully Automated! ✨)

**Simply approve the member in the admin portal** - that's it!

The system automatically:
1. ✅ Updates their status in Firestore
2. ✅ Creates their Firebase authentication account
3. ✅ Sends them a beautiful welcome email
4. ✅ Provides them a secure link to set their password
5. ✅ Guides them through the onboarding process

**You don't need to:**
- ❌ Log into Firebase Console
- ❌ Manually create users
- ❌ Generate temporary passwords
- ❌ Send credentials separately
- ❌ Provide setup instructions

**Everything happens automatically when you click "Approve"!**

### For Admins

1. **Create Admin User in Firebase Console:**
   - Go to Firebase Authentication → Users
   - Add admin email with a strong password

2. **Configure Admin Emails in Environment:**
   ```env
   NEXT_PUBLIC_ADMIN_EMAILS=admin@houseofmuziris.com,admin2@example.com
   Login Process

### Members
1. Visit `/login` or `/member/login`
2. Enter email address
3. Enter password
4. Click "Sign In"

### Admins
1. Visit `/admin` page
2. Enter admin email address
3. Enter password
4. Click "Enter Vault"

**No email quota limits!** Everyone can log in unlimited times per day.

## Benefits of This Approach

✅ **Zero Quota Issues** - Password authentication doesn't count against Firebase email quotas  
✅ **Instant Access** - No waiting for email links  
✅ **More Reliable** - No dependency on email delivery  
✅ **Secure** - Password authentication is Firebase's primary method  
✅ **Better UX** - Faster login, no inbox checking required  
✅ **Email Link Still Available** - Members can optionally use email links if preferred
## Benefits of This Approach

✅ **No Quota Limits** - Password authentication doesn't count against Firebase email quotas  
✅ **Instant Access** - No waiting for email links  
✅ **More Reliable** - No dependency on email delivery  
✅ **Secure** - Password authentication is a Firebase-supported method  
✅ **Member Experience Unchanged** - Regular members still use passwordless email links

## Security Best Practices

1. **Use Strong Passwords** - Minimum 12 characters, mix of letters, numbers, symbols
2. **Enable 2FA** - Consider enabling Firebase multi-factor authentication
3. **Rotate Passwords** - Change admin passwords regularly
4. **Monitor Access** - Review Firebase Auth logs for suspicious activity
5. **Limit Admin Emails** - Only add emails for trusted administrators

## Troubleshooting

### "Access denied. This email is not authorized for admin access."
- VeUsers prefer email links?
Email links are still available as an option on the `/login` page. Users can toggle between "Password" and "Email Link" methods. However, password is now the default to avoid quota issues.
- Verify the password in Firebase Console
- Reset password if needed through Firebase Console

### Still seeing quota errors for members?
Regular members use email links, which still have quotas. If members encounter quota issues:
1. **Increase Firebase Plan** - Upgrade to Blaze plan for higher quotas
2. **Implement Rate Limiting** - Already in place, but can be adjusted
3. **Add Password Option** - Consider allowing members to set passwords too

## Firebase Quota Limits (Reference)

### Spark Plan (Free)
- ~100 email link operations per day

### Blaze Plan (Pay-as-you-go)
- ~10,000 email link operations per day
- Additional operations at cost

**Note:** Admin password authentication does NOT count against these limits!

## Additional Resources
Password authentication (now the default) does NOT count against these limits!

## Automated Member Onboarding Flow ✨

When you approve a new member in the admin portal, **everything happens automatically**:

### What Happens When You Click "Approve"

1. **Firestore Updated:** Member's status set to "approved"
2. **Firebase User Created:** System generates a secure sign-in link
3. **Welcome Email Sent Automatically:** Member receives an email with:
   - Their membership confirmation
   - Their login email (username)
   - A secure "Set Your Password" button
   - List of their exclusive member benefits

### Member's Onboarding Experience

1. **Receives Welcome Email:**
   - Beautiful branded email with their membership details
   - Clear call-to-action button

2. **Clicks "Set Your Password & Enter the Guild":**
   - Opens secure password setup page
   - Link automatically verifies their identity
   - Email is pre-filled and confirmed

3. **Creates Their Password:**
   - Sets a strong password (8+ chars, uppercase, lowercase, number)
   - Password strength validation built-in
   - Immediate feedback on requirements

4. **Instantly Redirected to Dashboard:**
   - Automatically signed in
   - Full access to member portal
   - Ready to explore exclusive content

### No Manual Work Required! 🎉

- ❌ No Firebase Console login needed
- ❌ No manual user creation
- ❌ No temporary passwords to manage
- ❌ No separate credential sharing
- ✅ One-click approval → Member gets everything automatically
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Quotas and Limits](https://firebase.google.com/docs/auth/limits)
- [Password Authentication](https://firebase.google.com/docs/auth/web/password-auth)
