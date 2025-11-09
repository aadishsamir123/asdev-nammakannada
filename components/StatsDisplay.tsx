import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar, Surface, Text, useTheme } from 'react-native-paper';
import { Unit, UserProgress } from '../types';

interface StatsDisplayProps {
  userProgress: UserProgress | null;
  units: Unit[];
  variant?: 'compact' | 'full';
}

export default function StatsDisplay({ userProgress, units, variant = 'full' }: StatsDisplayProps) {
  const theme = useTheme();

  const stats = useMemo(() => {
    if (!userProgress) {
      return {
        xp: 0,
        streak: 0,
        totalStars: 0,
        completedLessons: 0,
        totalLessons: 0,
        progressPercentage: 0,
        averageScore: 0,
        totalAttempts: 0,
        perfectLessons: 0,
      };
    }

    const completedLessons = userProgress.completedLessonIds.length;
    
    // Calculate total lessons from units
    const totalLessons = units.reduce((sum, unit) => sum + unit.lessons.length, 0);
    
    const progressPercentage = totalLessons > 0 ? completedLessons / totalLessons : 0;

    // Calculate total stars earned
    const totalStars = Object.values(userProgress.lessonProgress).reduce(
      (sum, progress) => sum + (progress.stars || 0),
      0
    );

    // Calculate average score
    const completedProgress = Object.values(userProgress.lessonProgress).filter(p => p.completed);
    const averageScore = completedProgress.length > 0
      ? completedProgress.reduce((sum, p) => sum + p.score, 0) / completedProgress.length
      : 0;

    // Calculate total attempts
    const totalAttempts = Object.values(userProgress.lessonProgress).reduce(
      (sum, progress) => sum + progress.attempts,
      0
    );

    // Count perfect lessons (3 stars)
    const perfectLessons = Object.values(userProgress.lessonProgress).filter(
      p => p.stars === 3
    ).length;

    return {
      xp: userProgress.xp,
      streak: userProgress.streak,
      totalStars,
      completedLessons,
      totalLessons,
      progressPercentage,
      averageScore,
      totalAttempts,
      perfectLessons,
    };
  }, [userProgress, units]);

  if (!userProgress) {
    return (
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Loading stats...
      </Text>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <Surface style={styles.compactStatCard} elevation={1}>
          <MaterialCommunityIcons name="lightning-bolt" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={[styles.statValue, { color: theme.colors.onSurface }]}>
            {stats.xp}
          </Text>
          <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            XP
          </Text>
        </Surface>
        <Surface style={styles.compactStatCard} elevation={1}>
          <MaterialCommunityIcons name="fire" size={24} color="#FF6B00" />
          <Text variant="titleLarge" style={[styles.statValue, { color: theme.colors.onSurface }]}>
            {stats.streak}
          </Text>
          <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            Day Streak
          </Text>
        </Surface>
      </View>
    );
  }

  // Daily XP goal (50 XP per day)
  const dailyGoal = 50;
  const dailyProgress = Math.min((stats.xp % dailyGoal) / dailyGoal, 1);
  const xpUntilGoal = dailyGoal - (stats.xp % dailyGoal);

  return (
    <View style={styles.fullContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
          Your Stats
        </Text>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {/* XP Card */}
        <Surface style={styles.statCard} elevation={2}>
          <View style={[styles.statIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.statContent}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {stats.xp}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Total XP
            </Text>
          </View>
        </Surface>

        {/* Streak Card */}
        <Surface style={styles.statCard} elevation={2}>
          <View style={[styles.statIcon, { backgroundColor: '#FF6B0015' }]}>
            <MaterialCommunityIcons name="fire" size={32} color="#FF6B00" />
          </View>
          <View style={styles.statContent}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {stats.streak}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Day Streak
            </Text>
          </View>
        </Surface>

        {/* Stars Card */}
        <Surface style={styles.statCard} elevation={2}>
          <View style={[styles.statIcon, { backgroundColor: '#FFD70015' }]}>
            <MaterialCommunityIcons name="star" size={32} color="#FFD700" />
          </View>
          <View style={styles.statContent}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {stats.totalStars}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Stars Earned
            </Text>
          </View>
        </Surface>

        {/* Lessons Completed Card */}
        <Surface style={styles.statCard} elevation={2}>
          <View style={[styles.statIcon, { backgroundColor: `${theme.colors.tertiary}15` }]}>
            <MaterialCommunityIcons name="book-check" size={32} color={theme.colors.tertiary} />
          </View>
          <View style={styles.statContent}>
            <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {stats.completedLessons}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Lessons Done
            </Text>
          </View>
        </Surface>
      </View>

      {/* Overall Progress Section */}
      <View style={styles.progressSection}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Overall Progress
        </Text>
        <View style={styles.progressBar}>
          <ProgressBar
            progress={stats.progressPercentage}
            color={theme.colors.primary}
            style={{ height: 12, borderRadius: 6 }}
          />
        </View>
        <View style={styles.progressText}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {stats.completedLessons} of {stats.totalLessons} lessons completed
          </Text>
          <Text variant="bodyMedium" style={[styles.percentageText, { color: theme.colors.primary }]}>
            {Math.round(stats.progressPercentage * 100)}%
          </Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <Surface style={styles.miniStatCard} elevation={1}>
          <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
          <View style={styles.miniStatContent}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {stats.perfectLessons}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Perfect Scores
            </Text>
          </View>
        </Surface>

        <Surface style={styles.miniStatCard} elevation={1}>
          <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.secondary} />
          <View style={styles.miniStatContent}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {Math.round(stats.averageScore)}%
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Avg Score
            </Text>
          </View>
        </Surface>

        <Surface style={styles.miniStatCard} elevation={1}>
          <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.tertiary} />
          <View style={styles.miniStatContent}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {stats.totalAttempts}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Total Attempts
            </Text>
          </View>
        </Surface>
      </View>

      {/* Daily Goal */}
      <View style={styles.goalSection}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Daily Goal
        </Text>
        <Surface style={styles.goalCard} elevation={1}>
          <View style={styles.goalHeader}>
            <MaterialCommunityIcons name="target" size={24} color={theme.colors.primary} />
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {dailyGoal} XP
            </Text>
          </View>
          <ProgressBar
            progress={dailyProgress}
            color={theme.colors.primary}
            style={{ height: 8, borderRadius: 4, marginTop: 8 }}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            {xpUntilGoal} XP until goal
          </Text>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  compactStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  fullContainer: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
  },
  statsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  progressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    marginBottom: 8,
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    fontWeight: 'bold',
  },
  additionalStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  miniStatCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniStatContent: {
    flex: 1,
  },
  goalSection: {},
  goalCard: {
    padding: 16,
    borderRadius: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
