# Firestore Database Structure

This document describes the Firestore collections and their schema for the Namma Kannada app.

## Collections Overview

- **units**: Organizational structure for lessons
- **lessons**: Individual lesson content and questions
- **users**: User profile information
- **userProgress**: User learning progress and statistics
- **lessonResults**: Historical data of lesson attempts

---

## Collection: `units`

Represents a unit (group) of related lessons.

### Schema

| Field       | Type   | Description                          |
| ----------- | ------ | ------------------------------------ |
| id          | string | Auto-generated document ID           |
| title       | string | Unit title (e.g., "Basic Greetings") |
| description | string | Brief description of what's covered  |
| order       | number | Display order (0-indexed)            |
| color       | string | Hex color for visual distinction     |

### Example Document

\`\`\`json
{
"id": "unit_001",
"title": "Basic Greetings",
"description": "Learn common Kannada greetings and introductions",
"order": 0,
"color": "#58CC02"
}
\`\`\`

### Sample Data to Add

\`\`\`javascript
// Run in Firebase Console
const units = [
{
title: "Basic Greetings",
description: "Learn common Kannada greetings",
order: 0,
color: "#58CC02"
},
{
title: "Numbers",
description: "Count from 1 to 100 in Kannada",
order: 1,
color: "#1CB0F6"
},
{
title: "Family & Relationships",
description: "Words for family members",
order: 2,
color: "#CE82FF"
},
{
title: "Common Phrases",
description: "Everyday expressions",
order: 3,
color: "#FF9600"
}
];
\`\`\`

---

## Collection: `lessons`

Individual lessons with questions and content.

### Schema

| Field                   | Type   | Description                                      |
| ----------------------- | ------ | ------------------------------------------------ |
| id                      | string | Auto-generated document ID                       |
| title                   | string | Lesson title                                     |
| description             | string | What the lesson covers                           |
| unitId                  | string | Reference to parent unit                         |
| order                   | number | Order within the unit                            |
| xpReward                | number | Base XP awarded for completion                   |
| difficulty              | string | "beginner", "intermediate", or "advanced"        |
| requiredPreviousLessons | array  | Array of lesson IDs that must be completed first |
| questions               | array  | Array of question objects                        |

### Question Object Schema

| Field         | Type         | Description                             |
| ------------- | ------------ | --------------------------------------- |
| id            | string       | Unique question identifier              |
| type          | string       | Question type (see types below)         |
| question      | string       | The question text                       |
| correctAnswer | string/array | The correct answer(s)                   |
| options       | array        | Options for multiple choice (optional)  |
| pairs         | array        | Pairs for matching exercises (optional) |
| hint          | string       | Hint text (optional)                    |
| explanation   | string       | Explanation shown after answering       |
| questionAudio | string       | URL to audio file (optional)            |
| questionImage | string       | URL to image (optional)                 |
| xp            | number       | XP for this question                    |

### Question Types

- `multiple-choice`: Select one correct answer from options
- `fill-blank`: Type in the correct answer
- `match-pairs`: Match Kannada words with English
- `translate`: Translate a sentence
- `speak`: Speak the word/phrase (requires audio recording)
- `listen`: Listen and type what you hear (requires audio playback)

### Example Document

\`\`\`json
{
"id": "lesson_001",
"title": "Hello & Goodbye",
"description": "Learn basic greetings",
"unitId": "unit_001",
"order": 0,
"xpReward": 10,
"difficulty": "beginner",
"requiredPreviousLessons": [],
"questions": [
{
"id": "q1",
"type": "multiple-choice",
"question": "How do you say 'Hello' in Kannada?",
"options": ["ನಮಸ್ಕಾರ", "ವಿದಾಯ", "ಧನ್ಯವಾದ", "ಕ್ಷಮಿಸಿ"],
"correctAnswer": "ನಮಸ್ಕಾರ",
"explanation": "ನಮಸ್ಕಾರ (Namaskāra) is the formal way to say hello",
"xp": 5
},
{
"id": "q2",
"type": "multiple-choice",
"question": "What does 'ವಿದಾಯ' mean?",
"options": ["Hello", "Goodbye", "Thank you", "Sorry"],
"correctAnswer": "Goodbye",
"explanation": "ವಿದಾಯ (Vidāya) means goodbye",
"xp": 5
}
]
}
\`\`\`

### Sample Lessons to Add

\`\`\`javascript
// Lesson 1: Basic Greetings - Hello & Goodbye
{
title: "Hello & Goodbye",
description: "Learn basic greetings",
unitId: "unit_001", // Replace with actual unit ID
order: 0,
xpReward: 10,
difficulty: "beginner",
requiredPreviousLessons: [],
questions: [
{
id: "q1",
type: "multiple-choice",
question: "How do you say 'Hello' in Kannada?",
options: ["ನಮಸ್ಕಾರ", "ವಿದಾಯ", "ಧನ್ಯವಾದ", "ಕ್ಷಮಿಸಿ"],
correctAnswer: "ನಮಸ್ಕಾರ",
explanation: "ನಮಸ್ಕಾರ (Namaskāra) is how you say hello in Kannada",
xp: 5
},
{
id: "q2",
type: "multiple-choice",
question: "What does 'ವಿದಾಯ' mean in English?",
options: ["Hello", "Goodbye", "Thank you", "Welcome"],
correctAnswer: "Goodbye",
explanation: "ವಿದಾಯ (Vidāya) means goodbye",
xp: 5
}
]
}

// Lesson 2: Thank You & Sorry
{
title: "Thank You & Sorry",
description: "Express gratitude and apologize",
unitId: "unit_001",
order: 1,
xpReward: 10,
difficulty: "beginner",
requiredPreviousLessons: ["lesson_001"], // Replace with actual lesson ID
questions: [
{
id: "q1",
type: "multiple-choice",
question: "How do you say 'Thank you' in Kannada?",
options: ["ಧನ್ಯವಾದ", "ಕ್ಷಮಿಸಿ", "ನಮಸ್ಕಾರ", "ವಿದಾಯ"],
correctAnswer: "ಧನ್ಯವಾದ",
explanation: "ಧನ್ಯವಾದ (Dhanyavāda) means thank you",
xp: 5
},
{
id: "q2",
type: "multiple-choice",
question: "What does 'ಕ್ಷಮಿಸಿ' mean?",
options: ["Thank you", "Hello", "Sorry", "Goodbye"],
correctAnswer: "Sorry",
explanation: "ಕ್ಷಮಿಸಿ (Kṣamisi) means sorry or excuse me",
xp: 5
}
]
}

// Lesson 3: Numbers 1-10
{
title: "Numbers 1-10",
description: "Learn to count from 1 to 10",
unitId: "unit_002", // Numbers unit
order: 0,
xpReward: 15,
difficulty: "beginner",
requiredPreviousLessons: [],
questions: [
{
id: "q1",
type: "multiple-choice",
question: "What is 'ಒಂದು' in English?",
options: ["One", "Two", "Three", "Zero"],
correctAnswer: "One",
explanation: "ಒಂದು (Ondu) means one",
xp: 3
},
{
id: "q2",
type: "multiple-choice",
question: "How do you say 'Five' in Kannada?",
options: ["ಮೂರು", "ನಾಲ್ಕು", "ಐದು", "ಆರು"],
correctAnswer: "ಐದು",
explanation: "ಐದು (Aidu) means five",
xp: 3
},
{
id: "q3",
type: "multiple-choice",
question: "What number is 'ಹತ್ತು'?",
options: ["Eight", "Nine", "Ten", "Seven"],
correctAnswer: "Ten",
explanation: "ಹತ್ತು (Hattu) means ten",
xp: 3
}
]
}
\`\`\`

---

## Collection: `users`

User profile information (auto-created on signup).

### Schema

| Field       | Type      | Description                    |
| ----------- | --------- | ------------------------------ |
| uid         | string    | Firebase Auth user ID          |
| email       | string    | User's email address           |
| displayName | string    | User's display name (optional) |
| photoURL    | string    | Profile photo URL (optional)   |
| createdAt   | timestamp | Account creation date          |
| lastLogin   | timestamp | Last login timestamp           |

### Example Document

\`\`\`json
{
"uid": "user123",
"email": "user@example.com",
"displayName": "John Doe",
"photoURL": null,
"createdAt": "2025-01-01T00:00:00Z",
"lastLogin": "2025-01-10T10:30:00Z"
}
\`\`\`

---

## Collection: `userProgress`

Tracks user's learning progress (auto-created on signup).

### Schema

| Field              | Type      | Description                         |
| ------------------ | --------- | ----------------------------------- |
| userId             | string    | Reference to user document          |
| currentLessonId    | string    | ID of current/next lesson           |
| completedLessonIds | array     | Array of completed lesson IDs       |
| xp                 | number    | Total XP earned                     |
| streak             | number    | Current daily streak                |
| lastActivityDate   | timestamp | Last activity date                  |
| lessonProgress     | map       | Map of lesson ID to progress object |

### Lesson Progress Object

| Field       | Type      | Description                 |
| ----------- | --------- | --------------------------- |
| lessonId    | string    | Lesson identifier           |
| completed   | boolean   | Whether lesson is completed |
| score       | number    | Best score (0-100)          |
| attempts    | number    | Number of attempts          |
| completedAt | timestamp | Completion date (optional)  |
| stars       | number    | Stars earned (0-3)          |

### Example Document

\`\`\`json
{
"userId": "user123",
"currentLessonId": "lesson_003",
"completedLessonIds": ["lesson_001", "lesson_002"],
"xp": 150,
"streak": 5,
"lastActivityDate": "2025-01-10T10:30:00Z",
"lessonProgress": {
"lesson_001": {
"lessonId": "lesson_001",
"completed": true,
"score": 100,
"attempts": 1,
"completedAt": "2025-01-08T14:20:00Z",
"stars": 3
},
"lesson_002": {
"lessonId": "lesson_002",
"completed": true,
"score": 75,
"attempts": 2,
"completedAt": "2025-01-09T16:45:00Z",
"stars": 2
}
}
}
\`\`\`

---

## Collection: `lessonResults`

Historical data of individual lesson attempts.

### Schema

| Field          | Type      | Description               |
| -------------- | --------- | ------------------------- |
| lessonId       | string    | Lesson identifier         |
| userId         | string    | User identifier           |
| answers        | array     | Array of answer objects   |
| totalQuestions | number    | Total questions in lesson |
| correctAnswers | number    | Number of correct answers |
| xpEarned       | number    | XP earned in this attempt |
| stars          | number    | Stars earned (0-3)        |
| completedAt    | timestamp | Completion timestamp      |
| timeSpent      | number    | Time spent in seconds     |

### Answer Object

| Field      | Type         | Description                      |
| ---------- | ------------ | -------------------------------- |
| questionId | string       | Question identifier              |
| userAnswer | string/array | User's answer                    |
| isCorrect  | boolean      | Whether answer was correct       |
| timeSpent  | number       | Time spent on question (seconds) |

### Example Document

\`\`\`json
{
"lessonId": "lesson_001",
"userId": "user123",
"totalQuestions": 5,
"correctAnswers": 5,
"xpEarned": 25,
"stars": 3,
"completedAt": "2025-01-08T14:20:00Z",
"timeSpent": 180,
"answers": [
{
"questionId": "q1",
"userAnswer": "ನಮಸ್ಕಾರ",
"isCorrect": true,
"timeSpent": 12
}
]
}
\`\`\`

---

## Firestore Security Rules

Here's a basic security rules configuration:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
// Allow users to read all units and lessons
match /units/{unitId} {
allow read: if request.auth != null;
}

    match /lessons/{lessonId} {
      allow read: if request.auth != null;
    }

    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /lessonResults/{resultId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
    }

}
}
\`\`\`

---

## Quick Start: Add Sample Data

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Create each collection and add the sample documents above
4. Make sure to:
   - Replace unit IDs in lessons with actual generated IDs
   - Update `requiredPreviousLessons` with actual lesson IDs
   - Use consistent naming for easy tracking

## Indexes

Firestore may require composite indexes for certain queries. Create these if prompted:

- Collection: `lessons`, Fields: `unitId` (Ascending), `order` (Ascending)
- Collection: `lessonResults`, Fields: `userId` (Ascending), `completedAt` (Descending)
