import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  ProgressBar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import InteractiveKannadaWord from '../../components/InteractiveKannadaWord';
import LessonCompletionScreen from '../../components/LessonCompletionScreen';
import { useAuth } from '../../contexts/AuthContext';
import {
  completeLessonAndUpdateProgress,
  getLessonById,
  updateStreak,
} from '../../services/firestore';
import { Answer, Lesson, LessonResult } from '../../types';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasTypo, setHasTypo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  // Helper function to calculate Levenshtein distance for typo detection
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Check if answer is close enough (typo tolerance)
  const isTypo = (userAnswer: string, correctAnswer: string): boolean => {
    const distance = levenshteinDistance(
      userAnswer.toLowerCase().trim(),
      correctAnswer.toLowerCase().trim()
    );
    const maxLength = Math.max(userAnswer.length, correctAnswer.length);
    // Allow 1-2 character differences for typos
    return distance > 0 && distance <= Math.max(1, Math.floor(maxLength * 0.2));
  };

  // Text-to-speech helper
  const speakText = (text: string, language: string = 'kn-IN') => {
    Speech.speak(text, {
      language,
      pitch: 1,
      rate: 0.85,
    });
  };

  // Helper to detect Kannada characters
  const isKannada = (char: string): boolean => {
    const code = char.charCodeAt(0);
    return code >= 0x0C80 && code <= 0x0CFF;
  };

  // Component to render question text with interactive Kannada words
  const QuestionTextWithTransliteration = ({ text, transliterations }: { text: string; transliterations?: Record<string, string> }) => {
    if (!transliterations || Object.keys(transliterations).length === 0) {
      // If there are Kannada words but no transliterations, still render normally
      return (
        <Text variant="headlineSmall" style={[styles.questionText, { color: theme.colors.onSurface }]}>
          {text}
        </Text>
      );
    }

    // Split text into words while preserving spaces
    const parts = text.split(/(\s+)/);
    
    return (
      <View style={styles.questionTextContainer}>
        {parts.map((part, index) => {
          const trimmedWord = part.trim();
          if (!trimmedWord) {
            // It's whitespace, render as is
            return <Text key={index} variant="headlineSmall" style={{ color: theme.colors.onSurface }}>{part}</Text>;
          }
          
          const hasKannada = trimmedWord.split('').some(isKannada);
          const transliteration = transliterations[trimmedWord];
          
          // If this word has Kannada characters and a transliteration, make it interactive
          if (hasKannada && transliteration) {
            return (
              <InteractiveKannadaWord
                key={index}
                word={trimmedWord}
                transliteration={transliteration}
                fontSize={24}
                inline={true}
              />
            );
          }
          
          return (
            <Text key={index} variant="headlineSmall" style={[styles.questionText, { color: theme.colors.onSurface }]}>
              {part}
            </Text>
          );
        })}
      </View>
    );
  };

  const loadLesson = async () => {
    if (!id) return;

    try {
      const lessonData = await getLessonById(id);
      setLesson(lessonData);
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    if (!lesson) return;
    
    const question = lesson.questions[currentQuestionIndex];
    
    // For explanation type, skip validation
    if (question.type === 'explanation') {
      handleNext();
      return;
    }
    
    if (!selectedAnswer) return;

    let correct = false;
    let typo = false;
    
    if (question.type === 'fill-blank') {
      // Get all possible correct answers (Kannada and transliteration)
      const correctAnswers: string[] = [];
      if (Array.isArray(question.correctAnswer)) {
        correctAnswers.push(...question.correctAnswer);
      } else if (question.correctAnswer) {
        correctAnswers.push(question.correctAnswer);
      }
      if (question.correctAnswerTransliteration) {
        correctAnswers.push(question.correctAnswerTransliteration);
      }

      // Check for exact match (case-insensitive)
      correct = correctAnswers.some(ans => 
        selectedAnswer.trim().toLowerCase() === ans.toLowerCase()
      );

      // If not exact match, check for typos
      if (!correct) {
        typo = correctAnswers.some(ans => isTypo(selectedAnswer, ans));
        if (typo) {
          correct = true; // Still mark as correct but show typo message
        }
      }
    } else {
      correct = Array.isArray(question.correctAnswer)
        ? question.correctAnswer.includes(selectedAnswer)
        : selectedAnswer === question.correctAnswer;
    }

    setIsCorrect(correct);
    setHasTypo(typo);
    setShowFeedback(true);

    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const answer: Answer = {
      questionId: question.id,
      userAnswer: selectedAnswer,
      isCorrect: correct,
      timeSpent,
    };

    setAnswers([...answers, answer]);
  };

  const handleNext = async () => {
    if (currentQuestionIndex < (lesson?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      setHasTypo(false);
      setQuestionStartTime(Date.now());
    } else {
      await completeLesson();
    }
  };

  const completeLesson = async () => {
    if (!lesson || !user || isCompleting) return;

    setIsCompleting(true);

    const totalQuestions = lesson.questions.length;
    const correctAnswers =
      answers.filter((a) => a.isCorrect).length + (isCorrect ? 1 : 0);
    const score = (correctAnswers / totalQuestions) * 100;

    // Calculate stars (0-3 based on score)
    let stars = 0;
    if (score >= 90) stars = 3;
    else if (score >= 70) stars = 2;
    else if (score >= 50) stars = 1;

    const xpEarned = Math.floor((lesson.xpReward * score) / 100);
    const timeSpent = (Date.now() - startTime) / 1000;

    const result: LessonResult = {
      lessonId: lesson.id,
      userId: user.uid,
      answers: [
        ...answers,
        {
          questionId: lesson.questions[currentQuestionIndex].id,
          userAnswer: selectedAnswer,
          isCorrect,
          timeSpent: (Date.now() - questionStartTime) / 1000,
        },
      ],
      totalQuestions,
      correctAnswers,
      xpEarned,
      stars,
      completedAt: new Date(),
      timeSpent,
    };

    try {
      await completeLessonAndUpdateProgress(user.uid, result);
      await updateStreak(user.uid);

      // Show completion screen with stats
      setLessonResult(result);
      setShowCompletion(true);
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to save progress');
      setIsCompleting(false);
    }
  };

  const handleContinue = () => {
    // Navigate back and trigger refresh of learn screen
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleLarge">Lesson not found</Text>
      </View>
    );
  }

  // Show completion screen after lesson is finished
  if (showCompletion && lessonResult) {
    return (
      <LessonCompletionScreen
        result={lessonResult}
        lessonTitle={lesson.title}
        onContinue={handleContinue}
      />
    );
  }

  const question = lesson.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / lesson.questions.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={0}>
        <View style={styles.headerTop}>
          <IconButton
            icon="close"
            size={24}
            onPress={() => router.back()}
            iconColor={theme.colors.onSurface}
          />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {lesson.title}
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="labelLarge" style={[styles.questionNumber, { color: theme.colors.onSurfaceVariant }]}>
          Question {currentQuestionIndex + 1} of {lesson.questions.length}
        </Text>
        <QuestionTextWithTransliteration 
          text={question.question} 
          transliterations={question.questionTransliteration}
        />

        {/* Explanation Type - Display vocabulary/content */}
        {question.type === 'explanation' && (
          <Card style={styles.explanationCard} mode="outlined">
            <Card.Content>
              {question.content && (
                <Text variant="bodyLarge" style={[styles.explanationContent, { color: theme.colors.onSurface }]}>
                  {question.content}
                </Text>
              )}
              {question.words && question.words.length > 0 && (
                <View style={styles.wordsContainer}>
                  {question.words.map((word, index) => (
                    <View key={index}>
                      {index > 0 && <Divider style={styles.wordDivider} />}
                      <View style={styles.wordItem}>
                        <View style={styles.wordHeader}>
                          <View style={styles.wordTextContainer}>
                            <Text variant="headlineSmall" style={[styles.kannadaText, { color: theme.colors.primary }]}>
                              {word.kannada}
                            </Text>
                            {word.transliteration && (
                              <Text variant="bodyMedium" style={[styles.transliteration, { color: theme.colors.onSurfaceVariant }]}>
                                ({word.transliteration})
                              </Text>
                            )}
                            <Text variant="titleMedium" style={[styles.englishText, { color: theme.colors.onSurface }]}>
                              {word.english}
                            </Text>
                          </View>
                          <IconButton
                            icon="volume-high"
                            size={24}
                            onPress={() => speakText(word.kannada)}
                            iconColor={theme.colors.primary}
                            style={styles.speakerButton}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Multiple Choice & True/False Types */}
        {(question.type === 'multiple-choice' || question.type === 'true-false') && (
          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const showCorrect = showFeedback && isCorrect && isSelected;
              const showIncorrect = showFeedback && !isCorrect && isSelected;
              const transliteration = question.optionsTransliteration?.[index];

              return (
                <Card
                  key={index}
                  mode={isSelected ? 'elevated' : 'outlined'}
                  style={[
                    styles.option,
                    showCorrect && { borderColor: theme.colors.tertiary, borderWidth: 2 },
                    showIncorrect && { borderColor: theme.colors.error, borderWidth: 2 },
                  ]}
                  onPress={() => handleAnswerSelect(option)}
                  disabled={showFeedback}
                >
                  <Card.Content style={styles.optionContent}>
                    <View style={styles.optionTextContainer}>
                      <Text
                        variant="bodyLarge"
                        style={[
                          styles.optionText,
                          { color: theme.colors.onSurface },
                          isSelected && { fontWeight: '600' },
                        ]}
                      >
                        {option}
                      </Text>
                      {transliteration && (
                        <Text
                          variant="bodySmall"
                          style={[styles.optionTransliteration, { color: theme.colors.onSurfaceVariant }]}
                        >
                          ({transliteration})
                        </Text>
                      )}
                    </View>
                    <View style={styles.optionRightContainer}>
                      {transliteration && (
                        <IconButton
                          icon="volume-high"
                          size={20}
                          onPress={() => speakText(option)}
                          iconColor={theme.colors.primary}
                          style={styles.optionSpeakerButton}
                        />
                      )}
                      {showCorrect && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={24}
                          color={theme.colors.tertiary}
                        />
                      )}
                      {showIncorrect && (
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={24}
                          color={theme.colors.error}
                        />
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}

        {/* Fill in the Blank Type */}
        {question.type === 'fill-blank' && (
          <View style={styles.fillBlankContainer}>
            <TextInput
              mode="outlined"
              placeholder="Type in Kannada or English..."
              value={selectedAnswer}
              onChangeText={setSelectedAnswer}
              style={styles.fillBlankInput}
              disabled={showFeedback}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!showFeedback && (
              <Card style={styles.hintCard} mode="outlined">
                <Card.Content style={styles.hintContent}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
                    You can type in Kannada or English pronunciation
                  </Text>
                </Card.Content>
              </Card>
            )}
            {question.hint && !showFeedback && (
              <Card style={styles.hintCard} mode="outlined">
                <Card.Content style={styles.hintContent}>
                  <MaterialCommunityIcons
                    name="lightbulb-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                    {question.hint}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        )}

        {showFeedback && (
          <Card
            style={[
              styles.feedback,
              {
                backgroundColor: isCorrect
                  ? theme.colors.tertiaryContainer
                  : theme.colors.errorContainer,
              },
            ]}
            mode="contained"
          >
            <Card.Content>
              <View style={styles.feedbackHeader}>
                <MaterialCommunityIcons
                  name={isCorrect ? 'check-circle' : 'close-circle'}
                  size={28}
                  color={isCorrect ? theme.colors.tertiary : theme.colors.error}
                />
                <Text
                  variant="titleLarge"
                  style={[
                    styles.feedbackTitle,
                    {
                      color: isCorrect
                        ? theme.colors.onTertiaryContainer
                        : theme.colors.onErrorContainer,
                    },
                  ]}
                >
                  {isCorrect ? (hasTypo ? 'Correct! (Careful of spelling)' : 'Correct!') : 'Incorrect'}
                </Text>
              </View>
              {question.explanation && (
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.feedbackText,
                    {
                      color: isCorrect
                        ? theme.colors.onTertiaryContainer
                        : theme.colors.onErrorContainer,
                    },
                  ]}
                >
                  {question.explanation}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Surface style={styles.footer} elevation={2}>
        {question.type === 'explanation' ? (
          <Button
            mode="contained"
            onPress={checkAnswer}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="arrow-right"
          >
            Continue
          </Button>
        ) : !showFeedback ? (
          <Button
            mode="contained"
            onPress={checkAnswer}
            disabled={!selectedAnswer}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Check
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={isCompleting}
            loading={isCompleting}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon={
              currentQuestionIndex < lesson.questions.length - 1
                ? 'arrow-right'
                : 'check'
            }
          >
            {currentQuestionIndex < lesson.questions.length - 1 ? 'Next' : 'Complete'}
          </Button>
        )}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  questionNumber: {
    marginBottom: 8,
  },
  questionText: {
    fontWeight: '600',
    marginBottom: 32,
  },
  // Explanation Type Styles
  explanationCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  explanationContent: {
    lineHeight: 24,
    marginBottom: 24,
  },
  wordsContainer: {
    gap: 4,
  },
  wordDivider: {
    marginVertical: 16,
  },
  wordItem: {
    paddingVertical: 8,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordTextContainer: {
    flex: 1,
  },
  kannadaText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  transliteration: {
    marginBottom: 4,
    fontStyle: 'italic',
  },
  englishText: {
    marginTop: 4,
  },
  speakerButton: {
    margin: 0,
  },
  // MCQ & True/False Styles
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    marginBottom: 2,
  },
  optionTransliteration: {
    fontStyle: 'italic',
    marginTop: 2,
  },
  optionRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Question text with transliterations
  questionTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  wordWithTransliterationWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  inlineTransliteration: {
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 2,
  },
  optionSpeakerButton: {
    margin: 0,
  },
  // Fill-Blank Styles
  fillBlankContainer: {
    gap: 16,
  },
  fillBlankInput: {
    fontSize: 16,
  },
  hintCard: {
    borderRadius: 12,
  },
  hintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Feedback Styles
  feedback: {
    marginTop: 24,
    borderRadius: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  feedbackTitle: {
    fontWeight: '600',
  },
  feedbackText: {
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
