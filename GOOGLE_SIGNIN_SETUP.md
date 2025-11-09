# Google Sign-In Setup Guide

This guide explains how to set up Google Sign-In with Firebase Authentication for the Namma Kannada app.

## Overview

The app now uses **Firebase Authentication's Google Sign-In** which handles authentication securely:

- **Web**: Uses `signInWithPopup` from Firebase Auth
- **iOS/Android**: Uses `expo-auth-session` with Firebase Auth integration

## Setup Steps

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** and enable it
5. Add your support email
6. Note the **Web Client ID** shown (you'll need this)

### 2. Google Cloud Console Setup (for iOS/Android)

#### For Android:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create credentials)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Android**
6. Enter your package name (from `app.json`):
   ```
   com.yourcompany.nammakannada
   ```
7. Get your SHA-1 certificate fingerprint:

   ```bash
   # For debug build
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

   # For release build (when you create your own keystore)
   keytool -list -v -keystore /path/to/your/keystore.jks -alias your-alias
   ```

8. Copy the SHA-1 fingerprint and paste it
9. Click **Create**
10. Copy the **Client ID** generated

#### For iOS:

1. In Google Cloud Console → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **iOS**
4. Enter your **Bundle ID** (from `app.json`):
   ```
   com.yourcompany.nammakannada
   ```
5. Click **Create**
6. Copy the **iOS Client ID** generated

### 3. Configure the App

Update `contexts/AuthContext.tsx` with your Client IDs:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com", // From Firebase Console
});
```

### 4. Update app.json (for EAS Build)

Add the following to your `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.nammakannada",
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.nammakannada",
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### 5. Download Config Files

#### For Android:

1. In Firebase Console → Project Settings
2. Under "Your apps", find your Android app
3. Download `google-services.json`
4. Place it in the project root

#### For iOS:

1. In Firebase Console → Project Settings
2. Under "Your apps", find your iOS app
3. Download `GoogleService-Info.plist`
4. Place it in the project root

### 6. Test the Implementation

```bash
# For web (should work immediately)
npm run web

# For iOS (requires EAS build or development build)
npm run ios

# For Android
npm run android
```

## How It Works

### Web Platform

```typescript
if (Platform.OS === "web") {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}
```

Firebase handles the entire OAuth flow in a popup window.

### iOS/Android Platforms

```typescript
else {
  // Trigger expo-auth-session
  const result = await promptAsync();

  // On success, Firebase receives the ID token
  // and creates/signs in the user automatically
}
```

The flow:

1. User taps "Continue with Google"
2. `promptAsync()` opens Google's OAuth screen
3. User authenticates with Google
4. Google returns an ID token
5. `signInWithCredential()` exchanges the token with Firebase
6. Firebase creates/authenticates the user
7. `onAuthStateChanged` triggers and loads user data

## Troubleshooting

### "Error 10" on Android

- SHA-1 fingerprint doesn't match
- Solution: Regenerate SHA-1 and update in Google Cloud Console

### "Invalid Client" error

- Wrong Client ID used
- Solution: Double-check you're using the correct Client ID for each platform

### Google Sign-In does nothing

- Check if webClientId is set correctly
- Ensure Firebase Google Sign-In is enabled
- Check console for error messages

### Works in Expo Go but not in build

- Expo Go uses its own certificates
- You need to create a development build or production build
- Solution: Use EAS Build

```bash
# Create a development build
eas build --profile development --platform android
eas build --profile development --platform ios

# Or production build
eas build --profile production --platform all
```

## Security Notes

1. **Never commit your Client IDs to version control** if they're sensitive
2. Use environment variables for production:
   ```typescript
   androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
   ```
3. Keep your `google-services.json` and `GoogleService-Info.plist` secure

## Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Expo Google Sign-In Guide](https://docs.expo.dev/guides/google-authentication/)
- [Google Cloud Console](https://console.cloud.google.com/)
