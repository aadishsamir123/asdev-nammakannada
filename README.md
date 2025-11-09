# ನಮ್ಮ ಕನ್ನಡ (Namma Kannada)

A React Native + Expo app for learning Kannada, inspired by Duolingo's lesson path approach.

## Features

- 🔐 **Authentication**: Email/Password and Google Sign-In via Firebase Auth
- 📚 **Lesson Path**: Duolingo-style progressive learning path with locked/unlocked lessons
- 🎯 **Interactive Lessons**: Multiple question types (multiple choice, fill-in-the-blank, etc.)
- 📊 **Progress Tracking**: XP system, streaks, stars, and lesson completion tracking
- 🔥 **Gamification**: Earn XP, maintain streaks, and unlock new lessons
- 💾 **Cloud Storage**: All lessons and user data stored in Firestore

## Tech Stack

- **React Native** with **Expo** (SDK 54)
- **TypeScript** for type safety
- **Firebase** (Authentication + Firestore)
- **Expo Router** for navigation
- **AsyncStorage** for local persistence

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password and Google Sign-In)
4. Create a **Firestore Database**
5. Get your Firebase config and update `config/firebase.ts`

**For Google Sign-In:** See `GOOGLE_SIGNIN_SETUP.md` for detailed OAuth configuration.

See `FIRESTORE_STRUCTURE.md` for detailed database schema and sample data.

### 3. Run the App

```bash
# Start the development server
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web
```

## Project Structure

```
app/
├── (auth)/         # Login, signup, forgot password
├── (tabs)/         # Main app (learn, profile)
├── lesson/[id].tsx # Lesson viewer
config/             # Firebase configuration
contexts/           # Auth context
services/           # Firestore services
types/              # TypeScript types
```

## Next Steps

1. **Configure Firebase**: Update `config/firebase.ts` with your Firebase project credentials
2. **Add Lesson Content**: Create units and lessons in Firestore (see `FIRESTORE_STRUCTURE.md`)
3. **Customize**: Update colors, branding, and content to match your vision
4. **Test**: Run the app and test authentication and lesson flow

For detailed setup instructions, database schema, and sample data, see `FIRESTORE_STRUCTURE.md`.

## License

MIT License
