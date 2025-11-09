# Interactive Kannada Words Feature

## Overview

This feature adds Duolingo-style interactive word tooltips to Kannada words in lesson questions. Users can tap on any Kannada word with a dotted underline to see its transliteration and hear its pronunciation.

## How It Works

### For Users

1. **Visual Indicator**: Kannada words in questions that have transliterations are displayed with a dotted underline and primary color
2. **Interactive**: Tap/press on any underlined Kannada word
3. **Tooltip Display**: A modal appears showing:
   - The Kannada word in large text
   - Its transliteration (pronunciation guide)
   - An audio button to hear the word pronounced
4. **Audio Playback**: Automatically plays audio when opened, can replay by tapping the audio button

### For Developers

#### Component: `InteractiveKannadaWord`

Located at: `/components/InteractiveKannadaWord.tsx`

**Props:**

- `word` (string): The Kannada word to display
- `transliteration` (string): The transliteration/pronunciation
- `fontSize` (number, optional): Font size for the word (default: 24)
- `inline` (boolean, optional): Whether to display inline or block (default: true)

**Features:**

- Dotted underline using repeating dots (React Native compatible)
- Modal tooltip with large, clear text
- Text-to-speech using Expo Speech API (Kannada language: 'kn-IN')
- Accessible close button
- Tap anywhere outside to dismiss

#### Usage in Lessons

The `QuestionTextWithTransliteration` component in `/app/lesson/[id].tsx` automatically processes question text and renders interactive Kannada words.

**Question Data Structure:**

```typescript
{
  question: "What does ಹತ್ತು mean?",
  questionTransliteration: {
    'ಹತ್ತು': 'Hattu'
  }
}
```

**For multiple Kannada words:**

```typescript
{
  question: "ಅಪ್ಪ and ಅಮ್ಮ mean Father and Mother",
  questionTransliteration: {
    'ಅಪ್ಪ': 'Appa',
    'ಅಮ್ಮ': 'Amma'
  }
}
```

#### Adding Transliterations to Questions

When creating or editing lessons, add the `questionTransliteration` field:

```typescript
{
  id: 'q1',
  type: 'multiple-choice',
  question: 'What does "ಧನ್ಯವಾದ" mean?',
  questionTransliteration: {
    'ಧನ್ಯವಾದ': 'Dhanyavāda'
  },
  options: ['Hello', 'Thank you', 'Goodbye'],
  correctAnswer: 'Thank you',
  // ... other fields
}
```

## Implementation Details

### Text Parsing

- Questions are split by words and whitespace
- Each word is checked for Kannada characters (Unicode range: 0x0C80-0x0CFF)
- Words with matching transliterations become interactive

### Audio

- Uses `expo-speech` with language code `kn-IN`
- Pitch: 1 (normal)
- Rate: 0.85 (slightly slower for learning)

### Styling

- Dotted underline created using repeated dot characters
- Primary theme color for highlighting
- Responsive modal with elevation
- Large, readable text in tooltip

## Benefits

1. **Contextual Learning**: Users learn pronunciation while reading questions
2. **Audio Support**: Helps with proper pronunciation
3. **Non-Intrusive**: Only words with transliterations are interactive
4. **Accessible**: Large touch targets, clear visual indicators
5. **Similar to Duolingo**: Familiar UX for language learners

## Future Enhancements

- Add English translations to the tooltip
- Include example sentences
- Track which words users tap most often
- Add option for automatic audio on hover (web)
- Vocabulary review system based on tapped words
