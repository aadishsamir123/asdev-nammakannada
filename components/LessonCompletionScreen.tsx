import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Surface, Text, useTheme } from 'react-native-paper';
import { LessonResult } from '../types';

interface LessonCompletionScreenProps {
  result: LessonResult;
  lessonTitle: string;
  onContinue: () => void;
}

export default function LessonCompletionScreen({
  result,
  lessonTitle,
  onContinue,
}: LessonCompletionScreenProps) {
  const theme = useTheme();
  const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const timeInMinutes = Math.floor(result.timeSpent / 60);
  const timeInSeconds = Math.floor(result.timeSpent % 60);

  const getStarColor = (index: number) => {
    return index < result.stars ? theme.colors.primary : theme.colors.surfaceVariant;
  };

  const getAccuracyMessage = () => {
    if (accuracy >= 90) return 'Outstanding!';
    if (accuracy >= 70) return 'Great Job!';
    if (accuracy >= 50) return 'Good Effort!';
    return 'Keep Practicing!';
  };

  const getAccuracyColor = () => {
    if (accuracy >= 90) return theme.colors.tertiary;
    if (accuracy >= 70) return theme.colors.secondary;
    return theme.colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.content} elevation={0}>
        {/* Celebration Icon */}
        <View style={styles.celebrationContainer}>
          <MaterialCommunityIcons
            name="trophy-variant"
            size={80}
            color={theme.colors.primary}
          />
        </View>

        {/* Title */}
        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
          Lesson Complete!
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {lessonTitle}
        </Text>

        {/* Stars */}
        <View style={styles.starsContainer}>
          {[0, 1, 2].map((index) => (
            <MaterialCommunityIcons
              key={index}
              name="star"
              size={48}
              color={getStarColor(index)}
              style={styles.star}
            />
          ))}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* XP Card */}
          <Card style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]} mode="elevated">
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={32}
                color={theme.colors.onPrimaryContainer}
              />
              <Text variant="displaySmall" style={[styles.statValue, { color: theme.colors.onPrimaryContainer }]}>
                {result.xpEarned}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                XP Earned
              </Text>
            </Card.Content>
          </Card>

          {/* Accuracy Card */}
          <Card style={[styles.statCard, { backgroundColor: theme.colors.secondaryContainer }]} mode="elevated">
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons
                name="bullseye-arrow"
                size={32}
                color={theme.colors.onSecondaryContainer}
              />
              <Text variant="displaySmall" style={[styles.statValue, { color: theme.colors.onSecondaryContainer }]}>
                {accuracy}%
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer }}>
                Accuracy
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Time Card */}
        <Card style={[styles.timeCard, { backgroundColor: theme.colors.tertiaryContainer }]} mode="elevated">
          <Card.Content style={styles.timeContent}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={28}
              color={theme.colors.onTertiaryContainer}
            />
            <View style={styles.timeTextContainer}>
              <Text variant="titleLarge" style={{ color: theme.colors.onTertiaryContainer, fontWeight: '600' }}>
                {timeInMinutes > 0 ? `${timeInMinutes}m ${timeInSeconds}s` : `${timeInSeconds}s`}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onTertiaryContainer }}>
                Time Taken
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Performance Message */}
        <Card style={styles.messageCard} mode="outlined">
          <Card.Content style={styles.messageContent}>
            <Text variant="headlineSmall" style={[styles.messageText, { color: getAccuracyColor() }]}>
              {getAccuracyMessage()}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              You answered {result.correctAnswers} out of {result.totalQuestions} questions correctly
            </Text>
          </Card.Content>
        </Card>

        {/* Continue Button */}
        <Button
          mode="contained"
          onPress={onContinue}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon="arrow-right"
        >
          Continue
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContainer: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  star: {
    // Individual star styling if needed
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
  },
  statContent: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  statValue: {
    fontWeight: '700',
  },
  timeCard: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 16,
  },
  timeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  timeTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  messageCard: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 32,
  },
  messageContent: {
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
