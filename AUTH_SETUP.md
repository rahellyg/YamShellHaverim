# Authentication Setup Guide

## Overview
The authentication system supports:
- Email/password login for regular users
- User registration
- Google Sign-In (via Firebase)
- Predefined manager login with secure credentials

## Default Manager Credentials

**Important:** These are the predefined manager credentials:

```
Email: admin@yamshell.com
Password: Manager2026!
```

⚠️ **Security Note:** Change these credentials in production by editing `app.js` line 5-9.

## User Authentication

### For Regular Users:
1. Click on "משתמש" (User) tab
2. **To Register:**
   - Click "הירשם כאן" (Register here)
   - Enter full name, email, and password (min 6 characters)
   - Click "הרשמה" (Register)
   - You'll be automatically logged in

3. **To Login:**
   - Enter registered email and password
   - Click "כניסה" (Login)

### User Database
- Users are stored in localStorage under the key `yam-users-db`
- Passwords are stored in plain text (for demo purposes only)
- In production, implement proper backend authentication

## Google Sign-In Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard

### Step 2: Enable Google Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Google" provider
3. Add your authorized domains (e.g., localhost, your-domain.com)

### Step 3: Get Firebase Configuration
1. Go to Project Settings (gear icon) → "General"
2. Scroll to "Your apps" section
3. Click the web icon (</>)
4. Copy the `firebaseConfig` object

### Step 4: Update app.js
Replace lines 12-19 in `app.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Testing Google Sign-In
- Click the "המשך עם Google" button
- Select your Google account
- First-time users are automatically added to the users database
- You'll be logged in as a regular user (not manager)

## Role-Based Access

### User Role (משתמש)
Can access:
- Friends finder
- Photo archive
- Volunteering section
- Donations section

### Manager Role (מנהל)
Can access:
- Everything users can access
- **Plus:** Meeting management (create/view meetings)

## Security Considerations

### For Development/Demo:
✅ Current implementation is suitable for:
- Local development
- Demo purposes
- Educational projects

### For Production:
⚠️ **Must implement:**
1. Backend server (Node.js, Python, etc.)
2. Proper password hashing (bcrypt, argon2)
3. JWT or session-based authentication
4. HTTPS only
5. Rate limiting
6. Input validation and sanitization
7. CORS configuration
8. Environment variables for secrets

## Testing the System

### Test User Login:
1. Register a new user account
2. Logout
3. Login with the same credentials
4. Verify you only see user sections (no meetings management)

### Test Manager Login:
1. Switch to "מנהל" (Manager) tab
2. Use credentials: `admin@yamshell.com` / `Manager2026!`
3. Verify you see all sections including meeting management

### Test Google Sign-In:
1. Click "המשך עם Google"
2. Authenticate with Google account
3. Verify automatic user registration and login

## Troubleshooting

### Google Sign-In Not Working:
- Check browser console for errors
- Verify Firebase config is correct
- Ensure domain is authorized in Firebase Console
- Check if popups are blocked by browser

### Cannot Login:
- Verify credentials are correct
- Check localStorage is enabled
- Clear localStorage and try registering again
- Check browser console for JavaScript errors

### Manager Login Fails:
- Ensure exact credentials are used (case-sensitive)
- Check for extra spaces in email/password fields

## Data Storage

### localStorage Keys:
- `yam-shell-haverim-v1` - App state and data
- `yam-users-db` - User accounts database

### Clear All Data:
Open browser console and run:
```javascript
localStorage.clear();
location.reload();
```

## Future Enhancements

Consider implementing:
- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- OAuth with other providers (Facebook, Apple)
- Real backend with database (MongoDB, PostgreSQL)
- User profile management
- Multiple manager accounts
