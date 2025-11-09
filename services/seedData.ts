import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';

export const seedTestData = async () => {
  try {
    const batch = writeBatch(db);

    // Create Units
    const units = [
      {
        id: 'unit_001',
        title: 'Basic Greetings',
        description: 'Learn common Kannada greetings and introductions',
        order: 0,
        color: '#58CC02',
      },
      {
        id: 'unit_002',
        title: 'Numbers',
        description: 'Count from 1 to 100 in Kannada',
        order: 1,
        color: '#1CB0F6',
      },
      {
        id: 'unit_003',
        title: 'Family & Relationships',
        description: 'Words for family members',
        order: 2,
        color: '#CE82FF',
      },
      {
        id: 'unit_004',
        title: 'Daily Conversations',
        description: 'Common phrases for everyday situations',
        order: 3,
        color: '#FF9600',
      },
    ];

    // Add units to batch
    for (const unit of units) {
      const unitRef = doc(db, 'units', unit.id);
      batch.set(unitRef, unit);
    }

    // Create Lessons with diverse question types
    const lessons = [
      // Lesson 1: Explanation + MCQ + True/False
      {
        id: 'lesson_001',
        title: 'Introduction to Greetings',
        description: 'Learn basic greeting words',
        unitId: 'unit_001',
        order: 0,
        xpReward: 15,
        difficulty: 'beginner',
        requiredPreviousLessons: [],
        questions: [
          {
            id: 'q1',
            type: 'explanation',
            question: 'Common Kannada Greetings',
            content: 'Kannada has several ways to greet people. The most common formal greeting is ನಮಸ್ಕಾರ (Namaskāra). Let\'s learn some basic greetings!',
            words: [
              { kannada: 'ನಮಸ್ಕಾರ', english: 'Hello/Greetings', transliteration: 'Namaskāra' },
              { kannada: 'ಹಲೋ', english: 'Hi', transliteration: 'Halō' },
              { kannada: 'ವಿದಾಯ', english: 'Goodbye', transliteration: 'Vidāya' },
              { kannada: 'ಧನ್ಯವಾದ', english: 'Thank you', transliteration: 'Dhanyavāda' },
            ],
            xp: 0,
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'How do you say "Hello" formally in Kannada?',
            options: ['ನಮಸ್ಕಾರ', 'ವಿದಾಯ', 'ಧನ್ಯವಾದ', 'ಹಲೋ'],
            optionsTransliteration: ['Namaskāra', 'Vidāya', 'Dhanyavāda', 'Halō'],
            correctAnswer: 'ನಮಸ್ಕಾರ',
            explanation: 'ನಮಸ್ಕಾರ (Namaskāra) is the formal way to say hello in Kannada',
            xp: 5,
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'ವಿದಾಯ means "Thank you"',
            questionTransliteration: { 'ವಿದಾಯ': 'Vidāya' },
            options: ['True', 'False'],
            correctAnswer: 'False',
            explanation: 'ವಿದಾಯ (Vidāya) means "Goodbye", not "Thank you". ಧನ್ಯವಾದ means "Thank you".',
            xp: 5,
          },
          {
            id: 'q4',
            type: 'multiple-choice',
            question: 'What does "ಧನ್ಯವಾದ" mean?',
            questionTransliteration: { 'ಧನ್ಯವಾದ': 'Dhanyavāda' },
            options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
            correctAnswer: 'Thank you',
            explanation: 'ಧನ್ಯವಾದ (Dhanyavāda) means "Thank you"',
            xp: 5,
          },
        ],
      },
      // Lesson 2: More greetings with fill-in-the-blank
      {
        id: 'lesson_002',
        title: 'Polite Expressions',
        description: 'Learn to be polite in Kannada',
        unitId: 'unit_001',
        order: 1,
        xpReward: 15,
        difficulty: 'beginner',
        requiredPreviousLessons: ['lesson_001'],
        questions: [
          {
            id: 'q1',
            type: 'explanation',
            question: 'Polite Words & Phrases',
            content: 'Being polite is important in any language. Here are essential polite expressions in Kannada.',
            words: [
              { kannada: 'ಕ್ಷಮಿಸಿ', english: 'Sorry/Excuse me', transliteration: 'Kṣamisi' },
              { kannada: 'ದಯವಿಟ್ಟು', english: 'Please', transliteration: 'Dayaviṭṭu' },
              { kannada: 'ಸರಿ', english: 'Okay/Alright', transliteration: 'Sari' },
              { kannada: 'ತುಂಬಾ ಧನ್ಯವಾದ', english: 'Thank you very much', transliteration: 'Tumbā dhanyavāda' },
            ],
            xp: 0,
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'How do you say "Please" in Kannada?',
            options: ['ಕ್ಷಮಿಸಿ', 'ದಯವಿಟ್ಟು', 'ಸರಿ', 'ಧನ್ಯವಾದ'],
            optionsTransliteration: ['Kṣamisi', 'Dayaviṭṭu', 'Sari', 'Dhanyavāda'],
            correctAnswer: 'ದಯವಿಟ್ಟು',
            explanation: 'ದಯವಿಟ್ಟು (Dayaviṭṭu) means "Please"',
            xp: 5,
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'ಕ್ಷಮಿಸಿ can be used to say both "Sorry" and "Excuse me"',
            questionTransliteration: { 'ಕ್ಷಮಿಸಿ': 'Kṣamisi' },
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'ಕ್ಷಮಿಸಿ (Kṣamisi) is versatile and can mean both "Sorry" and "Excuse me"',
            xp: 5,
          },
          {
            id: 'q4',
            type: 'fill-blank',
            question: 'Complete: "Thank you very much" = ತುಂಬಾ ___',
            questionTransliteration: { 'ತುಂಬಾ': 'Tumbā' },
            correctAnswer: 'ಧನ್ಯವಾದ',
            correctAnswerTransliteration: 'Dhanyavāda',
            hint: 'Remember what "thank you" is in Kannada',
            explanation: 'ತುಂಬಾ ಧನ್ಯವಾದ (Tumbā dhanyavāda) means "Thank you very much"',
            xp: 5,
          },
        ],
      },
      // Lesson 3: Yes/No and basic responses
      {
        id: 'lesson_003',
        title: 'Yes, No & Basic Responses',
        description: 'Learn to agree and disagree',
        unitId: 'unit_001',
        order: 2,
        xpReward: 15,
        difficulty: 'beginner',
        requiredPreviousLessons: ['lesson_002'],
        questions: [
          {
            id: 'q1',
            type: 'explanation',
            question: 'Basic Responses',
            content: 'Knowing how to agree or disagree is fundamental. Let\'s learn these important words.',
            words: [
              { kannada: 'ಹೌದು', english: 'Yes', transliteration: 'Haudu' },
              { kannada: 'ಇಲ್ಲ', english: 'No', transliteration: 'Illa' },
              { kannada: 'ಬೇಡ', english: 'Don\'t want/No need', transliteration: 'Bēḍa' },
              { kannada: 'ಗೊತ್ತಿಲ್ಲ', english: 'I don\'t know', transliteration: 'Gottilla' },
            ],
            xp: 0,
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'How do you say "Yes" in Kannada?',
            options: ['ಹೌದು', 'ಇಲ್ಲ', 'ಬೇಡ', 'ಸರಿ'],
            optionsTransliteration: ['Haudu', 'Illa', 'Bēḍa', 'Sari'],
            correctAnswer: 'ಹೌದು',
            explanation: 'ಹೌದು (Haudu) means "Yes"',
            xp: 5,
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'ಇಲ್ಲ means "Yes"',
            questionTransliteration: { 'ಇಲ್ಲ': 'Illa' },
            options: ['True', 'False'],
            correctAnswer: 'False',
            explanation: 'ಇಲ್ಲ (Illa) means "No", not "Yes"',
            xp: 5,
          },
          {
            id: 'q4',
            type: 'multiple-choice',
            question: 'What does "ಗೊತ್ತಿಲ್ಲ" mean?',
            questionTransliteration: { 'ಗೊತ್ತಿಲ್ಲ': 'Gottilla' },
            options: ['Yes', 'No', 'I don\'t know', 'Maybe'],
            correctAnswer: 'I don\'t know',
            explanation: 'ಗೊತ್ತಿಲ್ಲ (Gottilla) means "I don\'t know"',
            xp: 5,
          },
        ],
      },
      // Lesson 4: Numbers with different question types
      {
        id: 'lesson_004',
        title: 'Numbers 1-10',
        description: 'Learn to count from 1 to 10',
        unitId: 'unit_002',
        order: 0,
        xpReward: 20,
        difficulty: 'beginner',
        requiredPreviousLessons: ['lesson_003'],
        questions: [
          {
            id: 'q1',
            type: 'explanation',
            question: 'Numbers 1-10',
            content: 'Learning numbers is essential for daily life. Here are the numbers from 1 to 10 in Kannada.',
            words: [
              { kannada: 'ಒಂದು', english: '1 (One)', transliteration: 'Ondu' },
              { kannada: 'ಎರಡು', english: '2 (Two)', transliteration: 'Eraḍu' },
              { kannada: 'ಮೂರು', english: '3 (Three)', transliteration: 'Mūru' },
              { kannada: 'ನಾಲ್ಕು', english: '4 (Four)', transliteration: 'Nālku' },
              { kannada: 'ಐದು', english: '5 (Five)', transliteration: 'Aidu' },
              { kannada: 'ಆರು', english: '6 (Six)', transliteration: 'Āru' },
              { kannada: 'ಏಳು', english: '7 (Seven)', transliteration: 'Ēḷu' },
              { kannada: 'ಎಂಟು', english: '8 (Eight)', transliteration: 'Eṇṭu' },
              { kannada: 'ಒಂಬತ್ತು', english: '9 (Nine)', transliteration: 'Ombattu' },
              { kannada: 'ಹತ್ತು', english: '10 (Ten)', transliteration: 'Hattu' },
            ],
            xp: 0,
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'What is the number 1 in Kannada?',
            options: ['ಒಂದು', 'ಎರಡು', 'ಮೂರು', 'ನಾಲ್ಕು'],
            optionsTransliteration: ['Ondu', 'Eraḍu', 'Mūru', 'Nālku'],
            correctAnswer: 'ಒಂದು',
            explanation: 'ಒಂದು (Ondu) is the number 1',
            xp: 5,
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'ಐದು is the number 4 in Kannada',
            questionTransliteration: { 'ಐದು': 'Aidu' },
            options: ['True', 'False'],
            correctAnswer: 'False',
            explanation: 'ಐದು (Aidu) is 5, not 4. ನಾಲ್ಕು is 4.',
            xp: 5,
          },
          {
            id: 'q4',
            type: 'multiple-choice',
            question: 'What does "ಹತ್ತು" mean?',
            questionTransliteration: { 'ಹತ್ತು': 'Hattu' },
            options: ['Eight', 'Nine', 'Ten', 'Seven'],
            correctAnswer: 'Ten',
            explanation: 'ಹತ್ತು (Hattu) is the number 10',
            xp: 5,
          },
          {
            id: 'q5',
            type: 'fill-blank',
            question: 'The number 3 in Kannada is: ___',
            questionTransliteration: { 'ಮ': 'Ma' },
            correctAnswer: 'ಮೂರು',
            correctAnswerTransliteration: 'Mūru',
            hint: 'It starts with ಮ',
            explanation: 'ಮೂರು (Mūru) is the number 3',
            xp: 5,
          },
        ],
      },
      // Lesson 5: Family members
      {
        id: 'lesson_005',
        title: 'Family Members',
        description: 'Learn words for immediate family',
        unitId: 'unit_003',
        order: 0,
        xpReward: 20,
        difficulty: 'beginner',
        requiredPreviousLessons: ['lesson_004'],
        questions: [
          {
            id: 'q1',
            type: 'explanation',
            question: 'Immediate Family',
            content: 'Family is important in Kannada culture. Let\'s learn the words for immediate family members.',
            words: [
              { kannada: 'ಅಮ್ಮ', english: 'Mother', transliteration: 'Amma' },
              { kannada: 'ಅಪ್ಪ', english: 'Father', transliteration: 'Appa' },
              { kannada: 'ಅಣ್ಣ', english: 'Elder brother', transliteration: 'Aṇṇa' },
              { kannada: 'ಅಕ್ಕ', english: 'Elder sister', transliteration: 'Akka' },
              { kannada: 'ತಮ್ಮ', english: 'Younger brother', transliteration: 'Tamma' },
              { kannada: 'ತಂಗಿ', english: 'Younger sister', transliteration: 'Taṅgi' },
            ],
            xp: 0,
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'How do you say "Mother" in Kannada?',
            options: ['ಅಮ್ಮ', 'ಅಪ್ಪ', 'ಅಣ್ಣ', 'ಅಕ್ಕ'],
            optionsTransliteration: ['Amma', 'Appa', 'Aṇṇa', 'Akka'],
            correctAnswer: 'ಅಮ್ಮ',
            explanation: 'ಅಮ್ಮ (Amma) means mother',
            xp: 5,
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'ಅಪ್ಪ and ಅಮ್ಮ mean "Father" and "Mother"',
            questionTransliteration: { 'ಅಪ್ಪ': 'Appa', 'ಅಮ್ಮ': 'Amma' },
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'ಅಪ್ಪ (Appa) means "Father" and ಅಮ್ಮ (Amma) means "Mother".',
            xp: 5,
          },
          {
            id: 'q4',
            type: 'multiple-choice',
            question: 'What does "ಅಕ್ಕ" mean?',
            questionTransliteration: { 'ಅಕ್ಕ': 'Akka' },
            options: ['Mother', 'Father', 'Elder sister', 'Younger sister'],
            correctAnswer: 'Elder sister',
            explanation: 'ಅಕ್ಕ (Akka) means elder sister',
            xp: 5,
          },
          {
            id: 'q5',
            type: 'fill-blank',
            question: 'Younger sister in Kannada is: ___',
            questionTransliteration: { 'ತ': 'Ta' },
            correctAnswer: 'ತಂಗಿ',
            correctAnswerTransliteration: 'Taṅgi',
            hint: 'It starts with ತ',
            explanation: 'ತಂಗಿ (Taṅgi) means younger sister',
            xp: 5,
          },
        ],
      },
    ];

    // Add lessons to batch
    for (const lesson of lessons) {
      const lessonRef = doc(db, 'lessons', lesson.id);
      batch.set(lessonRef, lesson);
    }

    // Commit the batch
    await batch.commit();

    console.log('Test data seeded successfully!');
    return { success: true, message: 'Test data created successfully!' };
  } catch (error: any) {
    console.error('Error seeding data:', error);
    throw new Error(error.message || 'Failed to seed test data');
  }
};
