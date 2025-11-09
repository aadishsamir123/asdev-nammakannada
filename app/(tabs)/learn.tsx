import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Card,
  Chip,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import StatsRightPanel from '../../components/StatsRightPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getAllUnits, getUserProgress } from '../../services/firestore';
import { Lesson, Unit, UserProgress } from '../../types';

export default function LearnScreen() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { isDesktop, isTablet } = useResponsive();

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [unitsData, progressData] = await Promise.all([
        getAllUnits(),
        getUserProgress(user.uid),
      ]);

      setUnits(unitsData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when screen comes into focus (after completing a lesson)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const isLessonUnlocked = (lesson: Lesson): boolean => {
    if (!userProgress) return lesson.order === 0;
    
    if (lesson.order === 0) return true;
    if (lesson.requiredPreviousLessons.length === 0) return true;

    return lesson.requiredPreviousLessons.every((reqLessonId) =>
      userProgress.completedLessonIds.includes(reqLessonId)
    );
  };

  const getLessonStatus = (lesson: Lesson): 'locked' | 'available' | 'completed' => {
    if (!userProgress) return lesson.order === 0 ? 'available' : 'locked';
    
    if (userProgress.completedLessonIds.includes(lesson.id)) {
      return 'completed';
    }
    
    return isLessonUnlocked(lesson) ? 'available' : 'locked';
  };

  const getLessonIcon = (status: string) => {
    switch (status) {
      case 'locked':
        return 'lock';
      case 'completed':
        return 'check-circle';
      default:
        return 'book-open-variant';
    }
  };

  const getLessonColor = (status: string) => {
    switch (status) {
      case 'locked':
        return theme.colors.surfaceVariant;
      case 'completed':
        return theme.colors.tertiary;
      default:
        return theme.colors.primaryContainer;
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Desktop layout with stats panel on the side
  if (isDesktop) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.desktopLayout}>
          <View style={styles.mainContent}>
            <Surface style={[styles.headerCompact, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
              <Text variant="headlineLarge" style={[styles.headerTitle, { color: theme.colors.onPrimaryContainer }]}>
                Learning Path
              </Text>
              <Text variant="bodyLarge" style={[styles.headerSubtitle, { color: theme.colors.onPrimaryContainer }]}>
                Master Kannada with interactive lessons
              </Text>
            </Surface>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContentDesktop}>
              {units.map((unit) => (
                <View key={unit.id} style={styles.unitContainer}>
                  <Card style={styles.unitCard} mode="elevated">
                    <Card.Title
                      title={unit.title}
                      subtitle={unit.description}
                      titleVariant="headlineSmall"
                      titleStyle={{ fontWeight: 'bold' }}
                      left={(props) => (
                        <View
                          style={[
                            styles.unitIconContainer,
                            { backgroundColor: `${unit.color}20` },
                          ]}
                        >
                          <MaterialCommunityIcons name="book-open-page-variant" size={32} color={unit.color} />
                        </View>
                      )}
                    />
                    <Card.Content>
                      <View style={styles.lessonsGridDesktop}>
                        {unit.lessons.map((lesson) => {
                          const status = getLessonStatus(lesson);
                          const stars = userProgress?.lessonProgress[lesson.id]?.stars || 0;
                          const isDisabled = status === 'locked';

                          return (
                            <Card
                              key={lesson.id}
                              style={[
                                styles.lessonCardDesktop,
                                { backgroundColor: getLessonColor(status) },
                              ]}
                              mode="contained"
                              onPress={() => {
                                if (!isDisabled) {
                                  router.push(`/lesson/${lesson.id}` as any);
                                }
                              }}
                              disabled={isDisabled}
                            >
                              <Card.Content style={styles.lessonContent}>
                                <MaterialCommunityIcons
                                  name={getLessonIcon(status)}
                                  size={40}
                                  color={
                                    status === 'locked'
                                      ? theme.colors.onSurfaceVariant
                                      : status === 'completed'
                                      ? theme.colors.onTertiary
                                      : theme.colors.onPrimaryContainer
                                  }
                                />
                                <Text
                                  variant="titleMedium"
                                  style={[
                                    styles.lessonTitle,
                                    {
                                      color:
                                        status === 'locked'
                                          ? theme.colors.onSurfaceVariant
                                          : status === 'completed'
                                          ? theme.colors.onTertiary
                                          : theme.colors.onPrimaryContainer,
                                    },
                                  ]}
                                  numberOfLines={2}
                                >
                                  {lesson.title}
                                </Text>
                                {status === 'completed' && stars > 0 && (
                                  <View style={styles.starsContainer}>
                                    {[...Array(3)].map((_, i) => (
                                      <MaterialCommunityIcons
                                        key={i}
                                        name={i < stars ? 'star' : 'star-outline'}
                                        size={20}
                                        color="#FFD700"
                                      />
                                    ))}
                                  </View>
                                )}
                                {!isDisabled && status !== 'completed' && (
                                  <Chip
                                    mode="flat"
                                    compact
                                    style={styles.xpChip}
                                    textStyle={{ fontSize: 12 }}
                                  >
                                    +{lesson.xpReward} XP
                                  </Chip>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        })}
                      </View>
                    </Card.Content>
                  </Card>
                </View>
              ))}
            </ScrollView>
          </View>
          <StatsRightPanel userProgress={userProgress} units={units} />
        </View>
      </View>
    );
  }

  // Tablet and mobile layout
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
        <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onPrimaryContainer }]}>
          Learning Path
        </Text>
        {userProgress && (
          <View style={styles.stats}>
            <Surface style={styles.statCard} elevation={1}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {userProgress.xp}
              </Text>
              <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                XP
              </Text>
            </Surface>
            <Surface style={styles.statCard} elevation={1}>
              <MaterialCommunityIcons name="fire" size={24} color="#FF6B00" />
              <Text variant="titleLarge" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {userProgress.streak}
              </Text>
              <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Day Streak
              </Text>
            </Surface>
          </View>
        )}
      </Surface>

      <ScrollView style={styles.content} contentContainerStyle={isTablet ? styles.scrollContentTablet : styles.scrollContent}>
        {units.map((unit) => (
          <View key={unit.id} style={styles.unitContainer}>
            <Card style={styles.unitCard} mode="elevated">
              <Card.Title
                title={unit.title}
                subtitle={unit.description}
                titleVariant="titleLarge"
                titleStyle={{ fontWeight: 'bold' }}
                left={(props) => (
                  <View
                    style={[
                      styles.unitIconContainer,
                      { backgroundColor: `${unit.color}20` },
                    ]}
                  >
                    <MaterialCommunityIcons name="book-open-page-variant" size={28} color={unit.color} />
                  </View>
                )}
              />
              <Card.Content>
                <View style={styles.lessonsGrid}>
                  {unit.lessons.map((lesson) => {
                    const status = getLessonStatus(lesson);
                    const stars = userProgress?.lessonProgress[lesson.id]?.stars || 0;
                    const isDisabled = status === 'locked';

                    return (
                      <Card
                        key={lesson.id}
                        style={[
                          styles.lessonCard,
                          { backgroundColor: getLessonColor(status) },
                        ]}
                        mode="contained"
                        onPress={() => {
                          if (!isDisabled) {
                            router.push(`/lesson/${lesson.id}` as any);
                          }
                        }}
                        disabled={isDisabled}
                      >
                        <Card.Content style={styles.lessonContent}>
                          <MaterialCommunityIcons
                            name={getLessonIcon(status)}
                            size={32}
                            color={
                              status === 'locked'
                                ? theme.colors.onSurfaceVariant
                                : status === 'completed'
                                ? theme.colors.onTertiary
                                : theme.colors.onPrimaryContainer
                            }
                          />
                          <Text
                            variant="bodyMedium"
                            style={[
                              styles.lessonTitle,
                              {
                                color:
                                  status === 'locked'
                                    ? theme.colors.onSurfaceVariant
                                    : status === 'completed'
                                    ? theme.colors.onTertiary
                                    : theme.colors.onPrimaryContainer,
                              },
                            ]}
                            numberOfLines={2}
                          >
                            {lesson.title}
                          </Text>
                          {status === 'completed' && stars > 0 && (
                            <View style={styles.starsContainer}>
                              {[...Array(3)].map((_, i) => (
                                <MaterialCommunityIcons
                                  key={i}
                                  name={i < stars ? 'star' : 'star-outline'}
                                  size={16}
                                  color="#FFD700"
                                />
                              ))}
                            </View>
                          )}
                          {!isDisabled && status !== 'completed' && (
                            <Chip
                              mode="flat"
                              compact
                              style={styles.xpChip}
                              textStyle={{ fontSize: 11 }}
                            >
                              +{lesson.xpReward} XP
                            </Chip>
                          )}
                        </Card.Content>
                      </Card>
                    );
                  })}
                </View>
              </Card.Content>
            </Card>
          </View>
        ))}
      </ScrollView>
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
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerCompact: {
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 32,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerSubtitle: {
    opacity: 0.9,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentTablet: {
    padding: 24,
  },
  scrollContentDesktop: {
    padding: 40,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  unitContainer: {
    marginBottom: 16,
  },
  unitCard: {
    borderRadius: 16,
  },
  unitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  lessonsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  lessonCard: {
    width: '48%',
    minHeight: 140,
    borderRadius: 12,
  },
  lessonCardDesktop: {
    width: '31%', // 3 columns on desktop with gaps
    minWidth: 200,
    minHeight: 180,
    borderRadius: 16,
  },
  lessonContent: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  lessonTitle: {
    textAlign: 'center',
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  xpChip: {
    marginTop: 4,
  },
});
