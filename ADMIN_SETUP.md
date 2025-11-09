# Admin Setup Guide

## How to Enable Admin Access

Since the admin panel is protected by the `admin` field in user documents, you need to manually enable this field in Firestore for users who should have admin access.

## Method 1: Firebase Console (Easiest)

1. Open Firebase Console: https://console.firebase.google.com
2. Select your project: `namma-kannada` (or whatever you named it)
3. Go to **Firestore Database** from the left menu
4. Navigate to the `users` collection
5. Find and click on your user document (UID)
6. Click **Add field** button
7. Set:
   - **Field name**: `admin`
   - **Type**: `boolean`
   - **Value**: `true`
8. Click **Add**

## Method 2: Using Firebase Admin SDK (Backend)

If you have a backend service:

```javascript
const admin = require("firebase-admin");
const db = admin.firestore();

async function makeUserAdmin(userId) {
  await db.collection("users").doc(userId).update({
    admin: true,
  });
  console.log(`User ${userId} is now an admin`);
}

// Usage
makeUserAdmin("YOUR_USER_UID_HERE");
```

## Method 3: Temporary Development Script

Create a temporary script in your project:

```typescript
// scripts/makeAdmin.ts
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const makeUserAdmin = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { admin: true });
    console.log("User is now an admin!");
  } catch (error) {
    console.error("Error making user admin:", error);
  }
};

// Replace with your actual user ID
makeUserAdmin("YOUR_USER_UID_HERE");
```

## Finding Your User ID

### In the App

Your User ID (UID) is displayed in the Firestore `users` collection, but you can also:

1. Add a temporary display in the Profile screen:

```typescript
// In app/(tabs)/profile.tsx
<Text>UID: {user?.uid}</Text>
```

### In Firebase Console

1. Go to **Authentication** in Firebase Console
2. Find your email in the user list
3. Click on the user
4. Copy the **User UID** field

## Verification

After enabling admin access:

1. **Restart the app** (close and reopen)
2. Go to **Profile** screen
3. You should now see the **Admin** section at the bottom
4. Tap **Lesson Manager** to access the admin panel

## Admin Features Available

Once enabled, you'll have access to:

- ✅ **Lesson Manager** - View, edit, and delete all lessons
- ✅ **Create Test Lessons** - Seed database with sample data
- ✅ **Lesson Editor** - (Coming soon) Create and edit lessons
- ✅ **Statistics Dashboard** - View total units and lessons

## Revoking Admin Access

To remove admin access:

1. Go to Firestore Console
2. Find the user document
3. Delete the `admin` field OR set it to `false`
4. User will lose admin access on next app restart

## Security Considerations

⚠️ **Important**: The current implementation only has client-side checks. For production:

1. **Add Firestore Security Rules**:

```javascript
// In Firebase Console > Firestore > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admins to write to lessons and units
    match /lessons/{lessonId} {
      allow read: if true;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true;
    }

    match /units/{unitId} {
      allow read: if true;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true;
    }
  }
}
```

2. **Backend Validation**: Create Cloud Functions to validate admin operations
3. **Audit Logging**: Track who makes changes and when
4. **Role Management**: Consider using Firebase Custom Claims for more robust role management

## Troubleshooting

### "Access Denied" when trying to access admin panel

- Make sure `admin: true` field is set in your user document
- Restart the app completely
- Check that you're logged in with the correct account

### Admin section not showing in Profile

- Clear app data/cache
- Log out and log back in
- Verify the `admin` field in Firestore is exactly `true` (boolean)

### Changes not saving

- Check Firestore rules (see Security Considerations above)
- Check browser console for errors
- Verify network connectivity

## Example: First-Time Setup

```bash
# 1. Create your account in the app
# 2. Get your UID from Firebase Console
# 3. In Firebase Console > Firestore:
#    - Go to users collection
#    - Click your user document
#    - Add field: admin = true
# 4. Restart the app
# 5. Go to Profile > Admin > Create Test Lessons
# 6. Go to Profile > Admin > Lesson Manager
```

## Development Tips

### Quick Admin Toggle (Development Only)

You can add a hidden button to toggle admin status temporarily:

```typescript
// In Profile screen (REMOVE IN PRODUCTION)
<Button
  onPress={async () => {
    const userRef = doc(db, "users", user!.uid);
    await updateDoc(userRef, { admin: !user?.admin });
    // Force refresh
  }}
>
  Toggle Admin (DEV ONLY)
</Button>
```

**⚠️ REMOVE THIS BEFORE PRODUCTION!**

## Questions?

If you encounter issues:

1. Check Firebase Console for errors
2. Verify Firestore structure matches expected format
3. Check that authentication is working
4. Look for console errors in the app
